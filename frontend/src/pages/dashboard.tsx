import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [role, setRole] = useState(null);
  const [name, setName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    const storedName = localStorage.getItem("userName") || "User"; // Placeholder name

    if (!storedRole) {
      router.push("/");
    } else {
      setRole(storedRole);
      setName(storedName);
    }
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    router.push("/");
  };

  return (
    <div className="h-screen bg-gradient-to-br from-purple-500 to-blue-600 text-white flex flex-col">
      {/* Navbar - Dynamic based on Role */}
      <nav className="bg-blue-700 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Dashboard</h1>
        {role === "worker" ? (
          <div className="space-x-4">
            <button onClick={() => router.push("/worker-profile")} className="hover:underline">
              View Profile
            </button>
            <button onClick={() => router.push("/verify-payments")} className="hover:underline">
              Verify Payments
            </button>
            <button onClick={handleSignOut} className="hover:underline text-red-300">
              Sign Out
            </button>
          </div>
        ) : role === "contractor" ? (
          <div className="space-x-4">
            <button onClick={() => router.push("/contractor-profile")} className="hover:underline">
              View Profile
            </button>
            <button onClick={() => router.push("/manage-workers")} className="hover:underline">
              Manage Workers
            </button>
            <button onClick={() => router.push("/payments")} className="hover:underline">
              Payments
            </button>
            <button onClick={handleSignOut} className="hover:underline text-red-300">
              Sign Out
            </button>
          </div>
        ) : null}
      </nav>

      {/* Welcome Section */}
      <main className="flex flex-col items-center justify-center flex-grow text-center">
        <h1 className="text-5xl font-bold">Welcome, {name}!</h1>
        <p className="text-lg mt-4">A platform connecting contractors and workers seamlessly.</p>
      </main>
    </div>
  );
}
