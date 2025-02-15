import { useState } from "react";
import { registerWorker } from "../../utils/api";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function RegisterWorker() {
    const [aadhaar, setAadhaar] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [workerId, setWorkerId] = useState("");

    const handleRegister = async () => {
        if (aadhaar.length !== 12) {
            alert("Invalid Aadhaar number");
            return;
        }
        const result = await registerWorker(aadhaar, name, phone);
        if (result.success) {
            setWorkerId(result.workerId);
        } else {
            alert(result.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle className="text-primary text-center">Worker Registration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input type="text" placeholder="Aadhaar Number" value={aadhaar} onChange={(e) => setAadhaar(e.target.value)} />
                    <Input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                    <Input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    <Button className="w-full" onClick={handleRegister}>Register</Button>
                    {workerId && <p className="text-green-600 text-center">✅ Registration Successful! Worker ID: {workerId}</p>}
                </CardContent>
            </Card>
        </div>
    );
}
