import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { getWorkerAssignments } from "../../utils/api";

interface Assignment {
  assignment_id: number;
  contractor_id: string;
  aadhaar: number;
  expiration_date: string;
  payment: number;
  status: "paid" | "unpaid" | "dispute";
}

const WorkerAssignments: React.FC = () => {

    const [workerData, setWorkerData] = useState({
        name: 'User',
        aadhaar: 'aadhaar',
        role: 'worker'
      });

      useEffect(() => {
        const storedUserName = localStorage.getItem('userName');
        if (storedUserName) {
          const parsedData = JSON.parse(storedUserName);
          setWorkerData({
            name: parsedData.name || 'User',
            aadhaar: parsedData.aadhaar || 'aadhaar',
            role: 'worker'
          });
        }
      }, []);
     
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const workerAadhaar = workerData.aadhaar; // Replace with dynamic worker Aadhaar

  // Function to fetch assigned work for the worker
  const fetchWorkerAssignments = async () => {
    try {
      const response = await getWorkerAssignments(workerAadhaar);
      if (response.success) {
        setAssignments(response.data);
      } else {
        console.error("Error fetching worker assignments:", response.message);
      }
    } catch (error) {
      console.error("Failed to fetch worker assignments:", error);
    }
  };

  useEffect(() => {
    fetchWorkerAssignments();
  }, []);

  // Dummy dispute handler
  const handleRaiseDispute = (id: number) => {
    console.log(`Raising dispute for assignment ID: ${id}`);
    setAssignments(assignments.map(assignment =>
      assignment.assignment_id === id ? { ...assignment, status: "dispute" } : assignment
    ));
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-800 to-gray-900 text-white flex flex-col">
      <Navbar />

      <div className="flex flex-col items-center justify-center flex-grow p-8">
        <h2 className="text-3xl font-bold mb-6">My Assigned Work</h2>
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
                  className={`border-b h-12 ${assignment.status !== "unpaid" ? "bg-gray-300 text-gray-500" : "bg-white"}`}
                >
                  <td className="p-3 text-center">{assignment.aadhaar}</td>
                  <td className="p-3 text-center">{assignment.expiration_date}</td>
                  <td className="p-3 text-center">${assignment.payment}</td>
                  <td className="p-3 text-center font-semibold">{assignment.status}</td>
                  <td className="p-3 text-center">
                    {assignment.status === "unpaid" && (
                      <Button
                        className="bg-red-500 text-white px-4 py-2 rounded text-sm font-medium inline-block hover:bg-red-600"
                        onClick={() => handleRaiseDispute(assignment.assignment_id)}
                      >
                        Raise Dispute
                      </Button>
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

export default WorkerAssignments;