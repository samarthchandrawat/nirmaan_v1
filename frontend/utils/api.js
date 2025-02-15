const API_BASE_URL = "http://localhost:5001/api"; // Backend URL

export const registerWorker = async (aadhaar, name, phone) => {
    const response = await fetch(`${API_BASE_URL}/register-worker`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaar, name, phone }),
    });
    return response.json();
};

export const verifyWorker = async (aadhaar) => {
    const response = await fetch(`${API_BASE_URL}/get-worker/${aadhaar}`);
    return response.json();
};

export const assignWork = async (aadhaar, employer, workDays, dailyWage) => {
    const response = await fetch(`${API_BASE_URL}/assign-work`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaar, employer, workDays, dailyWage }),
    });
    return response.json();
};

export const processPayment = async (aadhaar, amount) => {
    const response = await fetch(`${API_BASE_URL}/process-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaar, amount }),
    });
    return response.json();
};

export const getPayments = async (aadhaar) => {
    const response = await fetch(`${API_BASE_URL}/get-payments/${aadhaar}`);
    return response.json();
};
