import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

const WorkerProfile = () => {
  const [workerData, setWorkerData] = useState({
    name: 'User',
    aadhaar: 'aadhaar',
  });

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

  return (
    <div className="h-screen bg-gradient-to-br from-blue-500 to-purple-600 text-white flex flex-col">
      <Navbar />

      <div className="flex items-center justify-center flex-grow">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 text-center border-t-4 border-blue-500">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Worker Profile</h2>
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-gray-100 p-4 w-full rounded-lg">
              <p className="text-gray-700 text-lg">
                <strong className="text-gray-900">Name:</strong> {workerData.name}
              </p>
            </div>
            <div className="bg-gray-100 p-4 w-full rounded-lg">
              <p className="text-gray-700 text-lg">
                <strong className="text-gray-900">Aadhaar:</strong> {workerData.aadhaar}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;
