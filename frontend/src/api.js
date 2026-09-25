const API_BASE = import.meta.env.VITE_API_URL || "";
const NOTES_ENDPOINT = `${API_BASE}/api/notes`;

const request = async (url, options = {}, accessToken) => {
  if (!accessToken) {
    throw new Error("No active session");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers
    }
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error ?? `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const getNotes = (accessToken) => {
  return request(NOTES_ENDPOINT, {}, accessToken);
};

export const createNote = (note, accessToken) => {
  return request(NOTES_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(note)
  }, accessToken);
};

export const updateNote = (id, updates, accessToken) => {
  return request(`${NOTES_ENDPOINT}/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates)
  }, accessToken);
};

export const deleteNote = (id, accessToken) => {
  return request(`${NOTES_ENDPOINT}/${id}`, {
    method: "DELETE"
  }, accessToken);
};