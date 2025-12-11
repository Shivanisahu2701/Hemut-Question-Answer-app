const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Post a question (guest)
export async function xhrPostQuestion(message) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/questions`);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
      else reject({ status: xhr.status, body: xhr.responseText });
    };
    xhr.onerror = () => reject({ status: xhr.status, body: xhr.responseText });
    xhr.send(JSON.stringify({ message }));
  });
}

// Fetch all questions
export async function fetchQuestions() {
  const r = await fetch(`${API_BASE}/questions`);
  return r.json();
}



export async function login(username, password) {
  const form = new FormData();
  form.append("username", username);
  form.append("password", password);

  const res = await fetch("http://localhost:8000/login", {
    method: "POST",
    body: form
  });

  if (!res.ok) throw await res.json();
  return await res.json();
}
// Register new user
export async function register(name, email, password, is_admin = false) {
  const r = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, is_admin })
  });
  if (!r.ok) throw await r.json();
  return r.json();
}

// Mark question as answered (admin)
export async function markAnswered(question_id, token) {
  const r = await fetch(`${API_BASE}/questions/${question_id}/answer`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!r.ok) throw await r.json();
  return r.json();
}

// Escalate question
export async function escalateQuestion(question_id) {
  const r = await fetch(`${API_BASE}/questions/${question_id}/escalate`, { method: "POST" });
  return r.json();
}
