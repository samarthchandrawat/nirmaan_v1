import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { getAssignedWork, raiseDispute, releasePayment } from "../../utils/api";

interface Assignment {
  assignment_id: number;
  aadhaar: string;
  expiration_date: string;
  payment: number;
  status: "paid" | "unpaid" | "dispute";
}

const contractorId = 15; // Replace with actual contractor ID if dynamic

const AssignedWork: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Fetch assigned work from API
  const fetchAssignedWork = async () => {
    try {
      const response = await getAssignedWork(contractorId);
      if (response.success) {
        const formattedAssignments = response.assignments.map((a: any) => ({
          assignment_id: a.id,
          aadhaar: a.aadhaar_number,
          expiration_date: a.expiration_date.split("T")[0], // Format date
          payment: Number(a.payment),
          status: a.status,
        }));
        setAssignments(formattedAssignments);
      }
    } catch (error) {
      console.error("Error fetching assigned work:", error);
    }
  };

  useEffect(() => {
    fetchAssignedWork();
  }, []);

  // Handle raising dispute
  const handleRaiseDispute = async (id: number) => {
    try {
      const response = await raiseDispute(id);
      if (response.success) {
        alert("✅ Dispute raised successfully!");
        fetchAssignedWork(); // Refresh data
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error("Error raising dispute:", error);
    }
  };

  // Handle releasing payment
  const handleReleasePayment = async (id: number) => {
    try {
      const response = await releasePayment(id, contractorId);
      if (response.success) {
        alert("✅ Payment released successfully!");
        fetchAssignedWork(); // Refresh data
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error("Error releasing payment:", error);
    }
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
                  className={`border-b ${
                    assignment.status === "dispute"
                      ? "bg-gray-300 text-gray-500"
                      : "bg-white"
                  } h-12`}
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
