import React from "react";

const Dashboard = () => {
  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center text-white"
      style={{ backgroundImage: "url('/images/dashboard.png')" }}
    >
      <div className="bg-black/60 p-8 rounded-xl shadow-xl text-center backdrop-blur-md max-w-xl">
        <h1 className="text-4xl font-bold mb-4">Welcome to your Pershelf!</h1>
        <p className="text-lg">Start curating your reading journey now 📚</p>
      </div>
    </div>
  );
};

export default Dashboard;