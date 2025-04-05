import React from "react";

const Register = () => {
  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/images/registerlogin.png')" }}
    >


      {/* Register kutusu */}
      <div className="relative z-10 bg-white/10 backdrop-blur-md text-white rounded-xl shadow-xl p-8 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Create your Pershelf account</h2>

        <form className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Full Name"
            className="bg-white/20 placeholder-white/70 text-white px-4 py-2 rounded-md focus:outline-none"
          />
          <input
            type="email"
            placeholder="Email"
            className="bg-white/20 placeholder-white/70 text-white px-4 py-2 rounded-md focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            className="bg-white/20 placeholder-white/70 text-white px-4 py-2 rounded-md focus:outline-none"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="bg-white/20 placeholder-white/70 text-white px-4 py-2 rounded-md focus:outline-none"
          />
          <button
            type="submit"
            className="bg-white text-black font-semibold py-2 rounded-md hover:bg-gray-200 transition"
          >
            Register
          </button>
        </form>

        <p className="text-sm mt-4 text-center">
          Already have an account?{" "}
          <a href="/login" className="underline text-white/90 hover:text-white">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
