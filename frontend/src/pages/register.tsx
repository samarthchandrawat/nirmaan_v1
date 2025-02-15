import { useState } from "react";
import { registerWorker } from "../../utils/api";
import { verifyWorkerBeforeRegistration} from "../../utils/api";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function RegisterWorker() {
    const [aadhaar, setAadhaar] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [dob, setDob] = useState("");
    const [workerId, setWorkerId] = useState("");
    const [verificationStatus, setVerificationStatus] = useState("");

    // const registerWorker = async (aadhaar, name, phone, email, dob) => {
    //     return new Promise((resolve) => {
    //         setTimeout(() => {
    //             resolve({
    //                 success: true,
    //                 workerId: "WKR123456",
    //             });
    //         }, 1000); // Simulate a slight delay
    //     });
    // };
    
    const handleRegister = async () => {

        //Check Aadhaar Number Requirements
        if (aadhaar.length !== 12) {
            alert("Invalid Aadhaar number");
            return;
        }

        //Validation via Government
        const verification = await verifyWorkerBeforeRegistration(aadhaar, name, phone, dob)

        if (!verification.success) {
            setVerificationStatus("Does not have government authorization to work");
            return
        } else {
            setVerificationStatus("");
        }

        //Finally register worker
        const result = await registerWorker(aadhaar, name, phone);
        if (result.success) {
            setVerificationStatus("");
            setWorkerId(result.workerId);
        } else {
            setVerificationStatus("Error: This account has already been registered.");
        }
        
        // Redirect to worker dashboard after a short delay
        // setTimeout(() => {
        //     window.location.href = "/worker-dashboard"; // Change this to match your actual dashboard route
        // }, 1000);
    };
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
            <Card className="w-full max-w-md shadow-lg bg-white p-6 rounded-lg">
                <CardHeader>
                    <CardTitle className="text-primary text-center text-xl font-semibold">
                        Worker Registration
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Label & Input for Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <Input 
                            type="text" 
                            placeholder="Your Name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="w-full border rounded-lg p-2"
                            required
                        />
                    </div>

                    {/* Label & Input for Aadhaar */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Aadhaar Number</label>
                        <Input 
                            type="text" 
                            placeholder="12-digit Aadhaar" 
                            value={aadhaar} 
                            onChange={(e) => setAadhaar(e.target.value)} 
                            className="w-full border rounded-lg p-2"
                            maxLength={12}
                            required
                        />
                    </div>

                    {/* Label & Input for Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <Input 
                            type="text" 
                            placeholder="Your Phone Number" 
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value)} 
                            className="w-full border rounded-lg p-2"
                            required
                        />
                    </div>

                    {/* Label & Input for DOB */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                        <Input 
                            type="date" 
                            value={dob} 
                            onChange={(e) => setDob(e.target.value)} 
                            className="w-full border rounded-lg p-2"
                            required
                        />
                    </div>

                    {/* Register Button */}
                    <Button className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition" 
                        onClick={handleRegister}>
                        Register
                    </Button>

                    {verificationStatus && (
                    <p className="text-red-600 text-center">{verificationStatus}</p> // Display the error message if verification fails
                    )}

                    {/* Success Message */}
                    {workerId && (
                        <p className="text-green-600 text-center mt-2">
                            ✅ Registration Successful! Worker ID: {workerId}
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
