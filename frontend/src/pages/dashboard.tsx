import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import ChatBox from "../components/ChatBox";

const Dashboard: React.FC = () => {
  const [role, setRole] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    const storedName = localStorage.getItem("userName") || "User"; // Placeholder name
    const storedUserId = localStorage.getItem("userId");

    if (!storedRole) {
      router.push("/");
    } else {
      setRole(storedRole);
      setName(storedName);
      setUserId(storedUserId);
    }
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    router.push("/");
  };

  return (
    <div className="h-screen bg-gradient-to-br from-purple-500 to-blue-600 text-white flex flex-col">
      {/* Navbar - Dynamic based on Role */}
      <Navbar />

      {/* Welcome Section */}
      <main className="flex flex-col items-center justify-center flex-grow text-center">
        <h1 className="text-5xl font-bold">Welcome, {name}!</h1>
        <p className="text-lg mt-4">A platform connecting contractors and workers seamlessly.</p>
      </main>

      {/* Chat Box */}
      <ChatBox userRole={role || undefined} userId={userId || undefined} />
    </div>
  );
};

export default Dashboard;
