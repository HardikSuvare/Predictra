
const API_BASE_URL = "http://127.0.0.1:8000";

async function request(endpoint, options = {}) {
  const headers = {
    ...options.headers,
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.detail || `API Error: ${response.status}`);
  }

  return data;
}

export const getHealth = () => request("/health");

export const getCustomers = (skip = 0, limit = 20, search = "") => {
  const params = new URLSearchParams({
    skip: String(skip),
    limit: String(limit),
    search,
  });

  return request(`/api/customers/?${params}`);
};

export const getCustomer = (customerId) =>
  request(`/api/customers/${encodeURIComponent(customerId)}`);

export const predictCustomer = (customerId) =>
  request(`/api/predictions/customer/${encodeURIComponent(customerId)}`);

export const getAllPredictions = (skip = 0, limit = 100) => {
  const params = new URLSearchParams({
    skip: String(skip),
    limit: String(limit),
  });

  return request(`/api/predictions/all?${params}`);
};

// Get workspace profile from MySQL
export const getProfile = () =>
  request("/api/settings/profile");

// Update workspace profile in MySQL
export const updateProfile = (profileData) =>
  request("/api/settings/profile", {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
