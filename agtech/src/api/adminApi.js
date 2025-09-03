const API_BASE = process.env.REACT_APP_API_URL || "";

const getToken = () => localStorage.getItem("access_token") || "";

async function apiRequest(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    let detail = "Request failed";
    try {
      const data = await res.json();
      detail =
        data.detail ||
        data.error ||
        (typeof data === "string" ? data : JSON.stringify(data));
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const AdminAPI = {
  dashboard: () => apiRequest("/admin-api/dashboard/"),
  cropsPerFarmer: () => apiRequest("/admin-api/crops-per-farmer/"),

  // Farmers
  listFarmers: () => apiRequest("/farmers/"),
  getFarmer: (id) => apiRequest(`/farmers/${id}/`),
  createFarmer: (payload) =>
    apiRequest("/farmers/", { method: "POST", body: JSON.stringify(payload) }),
  updateFarmer: (id, payload) =>
    apiRequest(`/farmers/${id}/`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteFarmer: (id) =>
    apiRequest(`/farmers/${id}/`, { method: "DELETE" }),

  // Crops (admin scope)
  listCrops: () => apiRequest("/admin-api/crops/"),
  getCrop: (id) => apiRequest(`/admin-api/crops/${id}/`),
  updateCrop: (id, payload) =>
    apiRequest(`/admin-api/crops/${id}/`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteCrop: (id) =>
    apiRequest(`/admin-api/crops/${id}/`, {
      method: "DELETE",
    }),
};