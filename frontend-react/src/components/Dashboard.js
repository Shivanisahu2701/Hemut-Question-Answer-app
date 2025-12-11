import React, { useEffect, useState, useRef } from "react";
import { fetchQuestions, markAnswered, escalateQuestion } from "../api";
import './Dashboard.css';

export default function Dashboard({ adminToken, isAdmin }) {
  const [questions, setQuestions] = useState([]);
  const wsRef = useRef(null);

  // Function to sort questions: escalated -> pending -> answered, newest first
  const sortQuestions = (qs) => {
    const statusPriority = { escalated: 3, pending: 2, answered: 1 };
    return [...qs].sort((a, b) => {
      if (statusPriority[b.status] !== statusPriority[a.status]) {
        return statusPriority[b.status] - statusPriority[a.status];
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });
  };

  // Initial load
  const load = async () => {
    const q = await fetchQuestions();
    setQuestions(sortQuestions(q));
  };

  useEffect(() => { load(); }, []);

  // WebSocket setup
  useEffect(() => {
    const wsUrl = process.env.REACT_APP_WS_URL || "ws://localhost:8000/ws";
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (evt) => {
      const payload = JSON.parse(evt.data);

      setQuestions(prev => {
        let updated;
        if (payload.event === "new_question") {
          updated = [...prev, payload.data];
        } else if (
          payload.event === "question_answered" ||
          payload.event === "question_escalated"
        ) {
          updated = prev.map(p => p.question_id === payload.data.question_id ? payload.data : p);
        } else {
          updated = prev;
        }
        return sortQuestions(updated); 
      });
    };

    ws.onopen = () => console.log("WS connected");
    ws.onclose = () => console.log("WS closed");
    ws.onerror = (err) => console.log("WS error", err);

    return () => ws.close();
  }, []);

  // Admin actions
  const handleAnswer = async (q) => {
    if (!adminToken) return;
    try { await markAnswered(q.question_id, adminToken); } 
    catch { alert("Failed to mark answered"); }
  };

  const handleEscalate = async (q) => {
    if (!adminToken) return;
    try { await escalateQuestion(q.question_id); } 
    catch { alert("Failed to escalate"); }
  };

  return (
    <div className="dashboard">
      <h2>Live Q&A</h2>
      {questions.map(q => (
        <div key={q.question_id} className={`question-card ${q.status}`}>
          <div><strong>{q.message}</strong></div>
          <div className="time-status">
            <span>Posted: {new Date(q.created_at).toLocaleString()}</span>
            <span>Status: {q.status}</span>
          </div>
          {isAdmin && (
            <div className="admin-buttons">
              <button onClick={() => handleEscalate(q)}>Escalate</button>
              <button onClick={() => handleAnswer(q)}>Mark Answered</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
