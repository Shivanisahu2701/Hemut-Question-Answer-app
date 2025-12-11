import React, { useState } from "react";
import { xhrPostQuestion } from "../api";
import './QuestionForm.css';

export default function QuestionForm({ onSuccess }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!message.trim()) {
      setError("Question cannot be blank");
      return;
    }
    try {
      await xhrPostQuestion(message.trim());
      setMessage("");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError("Failed to post question");
    }
  };

  return (
    <form className="question-form" onSubmit={handleSubmit}>
      <textarea
        rows="3"
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Ask a question..."
      />
      {error && <div className="error">{error}</div>}
      <button type="submit">Submit Question</button>
    </form>
  );
}
