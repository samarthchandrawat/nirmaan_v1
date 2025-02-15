import { useState } from "react";
import { verifyWorker } from "../../utils/api";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function VerifyWorker() {
    const [aadhaar, setAadhaar] = useState("");
    const [workerData, setWorkerData] = useState(null);

    const handleVerify = async () => {
        if (aadhaar.length !== 12) {
            alert("Invalid Aadhaar number");
            return;
        }
        const result = await verifyWorker(aadhaar);
        if (result.success) {
            setWorkerData(result);
        } else {
            alert(result.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle className="text-primary text-center">Verify Worker</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Aadhaar Input */}
                    <Input
                        type="text"
                        placeholder="Enter Aadhaar Number"
                        value={aadhaar}
                        onChange={(e) => setAadhaar(e.target.value)}
                    />
                    <Button className="w-full" onClick={handleVerify}>
                        Verify
                    </Button>

                    {/* Worker Data Display */}
                    {workerData && (
                        <div className="mt-4 p-3 bg-white shadow-md rounded-md">
                            <h3 className="text-lg font-semibold text-primary">Worker Verified</h3>
                            <p className="text-gray-600">👤 Name: <span className="font-semibold">{workerData.name}</span></p>
                            <p className="text-gray-600">📞 Phone: <span className="font-semibold">{workerData.phone}</span></p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
