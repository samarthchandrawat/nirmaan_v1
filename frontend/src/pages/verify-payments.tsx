import { useState, useEffect } from "react";
import { getPayments } from "../../utils/api";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import Navbar from "../components/Navbar"; // Assuming Navbar is still needed

export default function VerifyPayments() {
    const [workerData, setWorkerData] = useState({
        name: 'User',
        aadhaar: 'aadhaar',
      });
    const [payments, setPayments] = useState<any[]>([]);


    useEffect(() => {
        const storedUserName = localStorage.getItem('userName');
        if (storedUserName) {
          const parsedData = JSON.parse(storedUserName);
          setWorkerData({
            name: parsedData.name || 'User',
            aadhaar: parsedData.aadhaar || 'aadhaar',
          });
        }
      }, []);

    const fetchPayments = async () => {
        const result = await getPayments(workerData.aadhaar);
        setPayments(result.payments || []);
        if (result.payments.length == 0) {
            alert("You have no payments to show!");
        }
    };

    return (
        <div className="min-h-screen w-screen bg-gradient-to-br from-green-500 to-teal-600 text-white flex flex-col">
            <Navbar /> {/* Assuming Navbar is still used */}

            <div className="flex items-center justify-center flex-grow">
                <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 text-center border-t-4 border-teal-500">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Payments to You</h2>
                    <div className="space-y-4">
                        {/* Aadhaar Input */}
                        <Button
                            className="w-full bg-teal-500 text-white py-3 rounded-lg font-semibold hover:bg-teal-600"
                            onClick={fetchPayments}
                        >
                            View Payments
                        </Button>

                        {/* Payment History */}
                        {payments.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold text-secondary">Payment History</h3>
                                <ul className="mt-2 space-y-2">
                                    {payments.map((p, index) => (
                                        <li key={index} className="p-3 bg-white shadow-md rounded-md break-words overflow-auto">
                                            <p className="text-primary font-semibold">₹{p.amount}</p>
                                            <p className="text-sm text-gray-600">Employer: {p.employer}</p>
                                            <p className="text-xs text-gray-500">Txn: {p.transaction_hash}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
