import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";

export default function LoginPage() {
  const router = useRouter();
  const { role } = router.query;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    aadhar: "",
    otp: "",
  });

  const [error, setError] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!role || (role !== "worker" && role !== "contractor")) {
      router.push("/");
    }
  }, [role, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGetOtp = () => {
    if (!formData.aadhar || formData.aadhar.length !== 12) {
      setError("Please enter a valid 12-digit Aadhar number");
      return;
    }
    setIsOtpSent(true);
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (role === "worker") {
      if (!isOtpSent) {
        handleGetOtp();
        return;
      }

      if (!formData.otp || formData.otp.length !== 4) {
        setError("Enter a valid 4-digit OTP");
        return;
      }
    } else {
      if (!formData.email || !formData.password) {
        setError("Email and password are required");
        return;
      }
    }

    if (role === "worker" && formData.otp.match(/^\d{4}$/)) {
      localStorage.setItem("userRole", "worker");
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1000);
    } else if (role === "contractor") {
      localStorage.setItem("userRole", "contractor");
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1000);
    } else {
      setError("Invalid login credentials");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <Head>
        <title>Login - {role === "worker" ? "Worker" : "Contractor"}</title>
      </Head>

      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Login as {role === "worker" ? "Worker" : "Contractor"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {role === "worker" ? (
            <>
              <input
                type="text"
                name="aadhar"
                placeholder="Aadhar Number"
                value={formData.aadhar}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                maxLength={12}
                required
              />

              {!isOtpSent ? (
                <button
                  type="button"
                  className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition"
                  onClick={handleGetOtp}
                >
                  Get OTP
                </button>
              ) : (
                <>
                  <input
                    type="text"
                    name="otp"
                    placeholder="Enter OTP"
                    value={formData.otp}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg"
                    maxLength={4}
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 transition"
                  >
                    Submit
                  </button>
                </>
              )}

              {/* Sign-up link for workers */}
              <p className="text-center text-gray-600 mt-2">
                Don't have an account?{" "}
                <Link href="/register?role=worker" className="text-blue-500 hover:underline">
                  Sign up
                </Link>
              </p>
            </>
          ) : (
            <>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition"
              >
                Login
              </button>
            </>
          )}

          {error && <p className="text-red-500 text-center">{error}</p>}
          {success && <p className="text-green-500 text-center">Login successful!</p>}
        </form>
      </div>
    </div>
  );
}
