
const API_URL = "https://nearhand-r6fb.onrender.com";

export async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}
