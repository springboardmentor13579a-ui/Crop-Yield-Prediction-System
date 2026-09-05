const BASE_URL = "http://127.0.0.1:8000/users";

// --------------------
// Get All Users
// --------------------
export async function getUsers() {
  const response = await fetch(BASE_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return await response.json();
}

// --------------------
// Get One User
// --------------------
export async function getUser(id) {
  const response = await fetch(`${BASE_URL}/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  return await response.json();
}

// --------------------
// Add User
// --------------------
export async function addUser(user) {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to add user");
  }

  return data;
}

// --------------------
// Update User
// --------------------
export async function updateUser(id, user) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to update user");
  }

  return data;
}

// --------------------
// Delete User
// --------------------
export async function deleteUser(id) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to delete user");
  }

  return data;
}