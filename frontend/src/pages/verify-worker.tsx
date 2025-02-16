import { useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import {verifyWorker} from "../../utils/api.js";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

const Verify: React.FC = () => {
  const [aadhaar, setAadhaar] = useState<string>("");
  const [workerData, setWorkerData] = useState<any>(null);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const router = useRouter();

  // // Actual worker verification function
  // const verifyWorker = async (aadhaar: string) => {
  //   // Replace with actual API call
  //   const response = await fetch(`/api/verifyWorker?aadhaar=${aadhaar}`);
  //   return response.json();
  // };

  const handleVerify = async () => {
    // Validate if the Aadhaar number is exactly 12 digits long
    if (aadhaar.length !== 12 || !/^\d{12}$/.test(aadhaar)) {
      alert("Please enter a valid 12-digit Aadhaar number.");
      return;
    }

    // Call the actual verification function
    const result = await verifyWorker(aadhaar);

    if (result.success) {
      setWorkerData(result);
      setVerificationStatus("Worker verification successful!");
    } else {
      setWorkerData(null);
      setVerificationStatus("Worker verification failed. Citizen may not be authorized to work!");
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-green-500 to-teal-600 text-white flex flex-col">
      <Navbar />

      <div className="flex items-center justify-center flex-grow">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 text-center border-t-4 border-teal-500">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Verify Worker</h2>
          <div className="space-y-4">
          <Input
            type="text"
            placeholder="Enter Aadhaar Number"
            value={aadhaar}
            onChange={(e) => {
                // Ensure only numeric input and limit to 12 digits
                const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                setAadhaar(value);
            }}
            maxLength={12} // Ensure no more than 12 digits
            className="p-3 w-full border rounded-lg text-lg text-black"
            />
            <Button
              onClick={handleVerify}
              className="w-full bg-teal-500 text-white py-3 rounded-lg font-semibold hover:bg-teal-600"
            >
              Verify
            </Button>

            {verificationStatus && (
              <p className="mt-4 text-lg text-green-600">{verificationStatus}</p>
            )}

            {workerData && workerData.success && (
              <div className="mt-4 p-3 bg-white shadow-md rounded-md">
                <h3 className="text-lg font-semibold text-teal-500">Worker Verified</h3>
                <p className="text-gray-600">👤 Name: <span className="font-semibold">{workerData.name}</span></p>
                <p className="text-gray-600">📞 Phone: <span className="font-semibold">{workerData.phone}</span></p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verify;
