import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const Navbar = () => {
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    setRole(storedRole);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    router.push("/");
  };

  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between">
      <h1 className="text-xl font-bold">Nirmaan Project</h1>
      <ul className="flex space-x-4">
        {role === "worker" ? (
          <>
            <li><a href="/worker-tasks">My Tasks</a></li>
            <li><a href="/profile">Profile</a></li>
          </>
        ) : role === "contractor" ? (
          <>
            <li><a href="/contractor-projects">Projects</a></li>
            <li><a href="/workers">Workers</a></li>
          </>
        ) : null}
        <li>
          <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded">
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
