import { useState } from "react";
import Navbar from "../components/Navbar";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

const AssignWork: React.FC = () => {
  const [aadhaar, setAadhaar] = useState<string>("");
  const [days, setDays] = useState<number | "">("");
  const [payment, setPayment] = useState<number | "">("");
  const [message, setMessage] = useState<string | null>(null);

  // Dummy function simulating saving to PostgreSQL
  const saveAssignment = async (aadhaar: string, days: number, payment: number) => {
    const assignment = {
      assignment_id: Math.floor(Math.random() * 100000), // Random ID for now
      contractor_id: "C12345", // Replace with actual contractor ID
      aadhaar,
      expiration_date: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Calculate expiration date
      payment,
      status: "unpaid",
    };

    console.log("Saving to PostgreSQL (dummy function):", assignment);
    
    // Simulating an API call delay
    return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000));
  };

  const handleAssignWork = async () => {
    if (aadhaar.length !== 12 || !/^\d{12}$/.test(aadhaar)) {
      alert("Please enter a valid 12-digit Aadhaar number.");
      return;
    }
    if (!days || days <= 0) {
      alert("Please enter a valid number of days.");
      return;
    }
    if (!payment || payment <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }

    const result = await saveAssignment(aadhaar, Number(days), Number(payment));

    if (result.success) {
      setMessage("Work assigned successfully!");
      setAadhaar("");
      setDays("");
      setPayment("");
    } else {
      setMessage("Failed to assign work. Please try again.");
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex flex-col">
      <Navbar />

      <div className="flex items-center justify-center flex-grow">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 text-center border-t-4 border-indigo-500">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Assign Work</h2>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Enter Aadhaar Number"
              value={aadhaar}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 12);
                setAadhaar(value);
              }}
              maxLength={12}
              className="p-3 w-full border rounded-lg text-lg text-black"
            />
            <Input
              type="number"
              placeholder="Enter Number of Days"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="p-3 w-full border rounded-lg text-lg text-black"
            />
            <Input
              type="number"
              placeholder="Enter Payment Amount"
              value={payment}
              onChange={(e) => setPayment(Number(e.target.value))}
              className="p-3 w-full border rounded-lg text-lg text-black"
            />
            <Button
              onClick={handleAssignWork}
              className="w-full bg-indigo-500 text-white py-3 rounded-lg font-semibold hover:bg-indigo-600"
            >
              Assign Work
            </Button>

            {message && (
              <p className="mt-4 text-lg text-green-600">{message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignWork;
