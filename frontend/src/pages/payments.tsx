import { useState } from "react";
import { processPayment, getPayments } from "../../utils/api";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function WagePayments() {
    const [aadhaar, setAadhaar] = useState("");
    const [amount, setAmount] = useState("");
    const [payments, setPayments] = useState([]);

    const handlePayment = async () => {
        if (aadhaar.length !== 12 || amount <= 0) {
            alert("Invalid details");
            return;
        }
        const result = await processPayment(aadhaar, amount);
        if (result.success) {
            alert("✅ Payment Successful! TxHash: " + result.txHash);
            fetchPayments();
        } else {
            alert(result.message);
        }
    };

    const fetchPayments = async () => {
        if (aadhaar.length !== 12) {
            alert("Invalid Aadhaar number");
            return;
        }
        const result = await getPayments(aadhaar);
        setPayments(result.payments || []);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
            <Card className="w-full max-w-lg shadow-lg">
                <CardHeader>
                    <CardTitle className="text-primary text-center">Wage Payments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Aadhaar Input */}
                    <Input
                        type="text"
                        placeholder="Enter Aadhaar Number"
                        value={aadhaar}
                        onChange={(e) => setAadhaar(e.target.value)}
                    />
                    <Button className="w-full" onClick={fetchPayments}>
                        View Payments
                    </Button>

                    {/* Payment Input */}
                    <Input
                        type="text"
                        placeholder="Enter Amount (₹)"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    <Button className="w-full" onClick={handlePayment}>
                        Pay Worker
                    </Button>

                    {/* Payment History */}
                    {payments.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold text-secondary">Payment History</h3>
                            <ul className="mt-2 space-y-2">
                                {payments.map((p, index) => (
                                    <li key={index} className="p-3 bg-white shadow-md rounded-md">
                                        <p className="text-primary font-semibold">₹{p.amount}</p>
                                        <p className="text-sm text-gray-600">Employer: {p.employer}</p>
                                        <p className="text-xs text-gray-500">Txn: {p.transaction_hash}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
