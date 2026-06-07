const API = "https://coin-margoum-be.onrender.com";

async function handleResponse(res) {
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || "Request failed");
  }

  return data;
}

async function login(password) {
  console.log("Frontend sending password:", password);

  const res = await fetch(`${API}/api/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ password })
  });

  console.log("Backend status:", res.status);

  const data = await res.json();
  console.log("Backend response:", data);

  if (!res.ok) {
    throw new Error(data.error || "Login failed");
  }

  return data;
}

async function logout() {
  const res = await fetch(`${API}/api/logout`, {
    method: "POST",
    credentials: "include"
  });

  return handleResponse(res);
}

async function checkAdmin() {
  const res = await fetch(`${API}/api/admin/check`, {
    credentials: "include"
  });

  if (!res.ok) return false;

  const data = await res.json();
  return data.isAdmin;
}

async function getMenu() {
  const res = await fetch(`${API}/api/menu`);
  return handleResponse(res);
}


async function getAdminMenu() {
  const res = await fetch(`${API}/api/admin/menu`);
  return handleResponse(res);
}

async function addMenuItem(item) {
  const res = await fetch(`${API}/api/admin/menu`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(item)
  });

  return handleResponse(res);
}

async function uploadFoodImage(foodId, file) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API}/api/admin/menu/${foodId}/image`, {
    method: "POST",
    credentials: "include",
    body: formData
  });

  return handleResponse(res);
}

async function updateMenuItem(id, item) {
  const res = await fetch(`${API}/api/admin/menu/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(item)
  });

  return handleResponse(res);
}

async function deleteMenuItem(id) {
  const res = await fetch(`${API}/api/admin/menu/${id}`, {
    method: "DELETE",
    credentials: "include"
  });

  return handleResponse(res);
}