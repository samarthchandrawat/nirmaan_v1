import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

const Navbar: React.FC = () => {
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    setRole(storedRole);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("userRole");
    router.push("/");
  };

  return (
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      <h1 className="text-xl font-bold text-blue-600">Nirmaan</h1>

      {role && (
        <ul className="flex space-x-6">
          {role === "worker" ? (
            <>
              <li>
                <a href="/worker-profile" className="text-gray-700 hover:text-blue-600 font-medium">
                  View Profile
                </a>
              </li>
              <li>
                <a href="/verify-payments" className="text-gray-700 hover:text-blue-600 font-medium">
                  Verify Payments
                </a>
              </li>
            </>
          ) : role === "contractor" ? (
            <>
              <li>
                <a href="/verify-worker" className="text-gray-700 hover:text-blue-600 font-medium">
                  Verify Worker
                </a>
              </li>
              <li>
                <a href="/verify-payments" className="text-gray-700 hover:text-blue-600 font-medium">
                  Verify Payments
                </a>
              </li>
              <li>
                <a href="/pay-worker" className="text-gray-700 hover:text-blue-600 font-medium">
                  Pay Worker
                </a>
              </li>
            </>
          ) : null}

          <li>
            <button
              onClick={handleSignOut}
              className="text-red-500 hover:text-red-700 font-medium"
            >
              Sign Out
            </button>
          </li>
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
