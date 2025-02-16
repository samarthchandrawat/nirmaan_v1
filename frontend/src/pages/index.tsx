import Head from "next/head";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  return (
    <div className="h-screen flex flex-col justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <Head>
        <title>Login - Choose Your Role</title>
        <meta name="description" content="Select whether to login as a Worker or Contractor" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="text-center "> {/* Adjusted margin-top here */}
        {/* Welcome Heading */}
        <h1 className="text-white text-4xl font-bold mb-8">Welcome to Nirmaan</h1>
        
        {/* Role Selection Heading */}
        <h2 className="text-white text-2xl font-bold mb-8">Choose Your Role</h2>
        
        <div className="space-y-4">
          <button
            className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-md transition hover:bg-gray-200"
            onClick={() => router.push("/login?role=worker")}
          >
            Login as Worker
          </button>
          <br />
          <button
            className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg shadow-md transition hover:bg-gray-200"
            onClick={() => router.push("/login?role=contractor")}
          >
            Login as Contractor
          </button>
        </div>
      </div>
    </div>
  );
}
