const BASE_URL = "https://y9bwqpgxhk.execute-api.ca-central-1.amazonaws.com";

const request = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${BASE_URL}${url}`, options);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
};

export const getAllOutages = async () => {
    return request(`/outages`);
  };  

// Outages API
export const getOutages = async (params?: Record<string, string>) => {
  const query = params ? `?${new URLSearchParams(params).toString()}` : "";
  return request(`/outages${query}`);
};

export const getOutageById = async (outageId: string) => {
  return request(`/outages/${outageId}`);
};

export const createOutage = async (outageData: any) => {
  return request(`/outages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(outageData),
  });
};

export const updateOutage = async (outageId: string, outageData: any) => {
  return request(`/outages/${outageId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(outageData),
  });
};

export const deleteOutage = async (outageId: string) => {
  return request(`/outages/${outageId}`, { method: "DELETE" });
};

// Users API
export const getUserById = async (userId: string) => {
  return request(`/users/${userId}`);
};

const data = getAllOutages;
console.log(data);