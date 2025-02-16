import { useState } from "react";
import { processPayment, getPayments } from "../../utils/api";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar"; // Assuming Navbar is still used

export default function PayWorker() {
    const [aadhaar, setAadhaar] = useState("");
    const [amount, setAmount] = useState("");
    const [payments, setPayments] = useState<any[]>([]);

    const handlePayment = async () => {
        if (aadhaar.length !== 12 || amount <= 0) {
            alert("Invalid details");
            return;
        }
        const result = await processPayment(aadhaar, amount);
        if (result.success) {
            alert("✅ Payment Successful! TxHash: " + result.txHash);
            //fetchPayments();
            window.location.reload();
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
        <div className="h-screen bg-gradient-to-br from-green-500 to-teal-600 text-white flex flex-col">
            <Navbar /> {/* Assuming Navbar is still used */}

            <div className="flex items-center justify-center flex-grow">
                <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 text-center border-t-4 border-teal-500">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Wage Payments</h2>
                    <div className="space-y-4">
                        {/* Aadhaar Input */}
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
                        {/* <Button
                            className="w-full bg-teal-500 text-white py-3 rounded-lg font-semibold hover:bg-teal-600"
                            onClick={fetchPayments}
                        >
                            View Payments
                        </Button> */}

                        {/* Payment Input */}
                        <Input
                            type="text"
                            placeholder="Enter Amount (₹)"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="p-3 w-full border rounded-lg text-lg text-black"
                        />
                        <Button
                            className="w-full bg-teal-500 text-white py-3 rounded-lg font-semibold hover:bg-teal-600"
                            onClick={handlePayment}
                        >
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
                    </div>
                </div>
            </div>
        </div>
    );
}
