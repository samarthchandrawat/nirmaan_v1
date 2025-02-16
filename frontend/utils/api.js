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

export const verifyWorkerBeforeRegistration = async (aadhaar, name, phone, dob) => {
    const response = await fetch(`${API_BASE_URL}/verify-worker-before-registration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaar, name, phone, dob }),
    });
    return response.json();
};

export const assignWork = async ({ contractorId, aadhaar, days, payment }) => {
    const response = await fetch(`${API_BASE_URL}/assign-work`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contractorId, aadhaar, days, payment }),
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


// Fetch assigned work for a contractor
export const getAssignedWork = async (contractorId) => {
    const response = await fetch(`${API_BASE_URL}/contractor-assignments/${contractorId}`);
    return response.json();
};


// Fetch assigned work for a workers
export const getWorkerAssignments = async (aadhaar) => {
    const response = await fetch(`${API_BASE_URL}/assignments/${aadhaar}`);
    return response.json();
};


// Raise dispute for an assignment
export const raiseDispute = async (assignmentId) => {
    const response = await fetch(`${API_BASE_URL}/raise-dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId }),
    });
    return response.json();
};

// Release payment for an assignment
export const releasePayment = async (assignmentId, contractorId) => {
    const response = await fetch(`${API_BASE_URL}/release-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, contractorId }),
    });
    return response.json();
};