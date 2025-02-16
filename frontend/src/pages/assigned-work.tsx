import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";

interface Assignment {
  assignment_id: number;
  contractor_id: string;
  aadhaar: string;
  expiration_date: string;
  payment: number;
  status: "paid" | "unpaid" | "dispute";
}

const AssignedWork: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Dummy function to fetch assigned work (simulate PostgreSQL fetch)
  const fetchAssignedWork = async () => {
    // Simulated data
    const dummyData: Assignment[] = [
      { assignment_id: 1, contractor_id: "C123", aadhaar: "123456789012", expiration_date: "2025-03-01", payment: 500, status: "unpaid" },
      { assignment_id: 2, contractor_id: "C124", aadhaar: "987654321012", expiration_date: "2025-03-05", payment: 700, status: "paid" },
      { assignment_id: 3, contractor_id: "C125", aadhaar: "456789123012", expiration_date: "2025-03-10", payment: 600, status: "dispute" },
    ];

    // Simulate API delay
    setTimeout(() => setAssignments(dummyData), 1000);
  };

  useEffect(() => {
    fetchAssignedWork();
  }, []);

  // Dummy handlers
  const handleRaiseDispute = (id: number) => {
    console.log(`Raising dispute for assignment ID: ${id}`);
    setAssignments(assignments.map(assignment =>
      assignment.assignment_id === id ? { ...assignment, status: "dispute" } : assignment
    ));
  };

  const handleReleasePayment = (id: number) => {
    console.log(`Releasing payment for assignment ID: ${id}`);
    setAssignments(assignments.map(assignment =>
      assignment.assignment_id === id ? { ...assignment, status: "paid" } : assignment
    ));
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-800 to-gray-900 text-white flex flex-col">
      <Navbar />

      <div className="flex flex-col items-center justify-center flex-grow p-8">
        <h2 className="text-3xl font-bold mb-6">Assigned Work</h2>
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-6">
        <table className="w-full text-gray-900">
        <thead>
            <tr className="bg-gray-200">
            <th className="p-3 text-center">Aadhaar</th>
            <th className="p-3 text-center">Expiration Date</th>
            <th className="p-3 text-center">Payment</th>
            <th className="p-3 text-center">Status</th>
            <th className="p-3 text-center">Actions</th>
            </tr>
        </thead>
        <tbody>
            {assignments.map((assignment) => (
            <tr
                key={assignment.assignment_id}
                className={`border-b ${assignment.status === "dispute" ? "bg-gray-300 text-gray-500" : "bg-white"} h-12`}
            >
                <td className="p-3 text-center">{assignment.aadhaar}</td>
                <td className="p-3 text-center">{assignment.expiration_date}</td>
                <td className="p-3 text-center">${assignment.payment}</td>
                <td className="p-3 text-center font-semibold">{assignment.status}</td>
                <td className="p-3 text-center">
                {assignment.status === "unpaid" && (
                    <div className="flex space-x-2 justify-center">
                    <Button
                        className="bg-red-500 text-white px-4 py-2 rounded text-sm font-medium inline-block hover:bg-red-600"
                        onClick={() => handleRaiseDispute(assignment.assignment_id)}
                    >
                        Raise Dispute
                    </Button>
                    <Button
                        className="bg-green-500 text-white px-4 py-2 rounded text-sm font-medium inline-block hover:bg-green-600"
                        onClick={() => handleReleasePayment(assignment.assignment_id)}
                    >
                        Release Payment
                    </Button>
                    </div>
                )}
                </td>
            </tr>
            ))}
        </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default AssignedWork;
