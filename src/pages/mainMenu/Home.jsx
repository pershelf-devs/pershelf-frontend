import React, { useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";

const Home = () => {

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="h-screen flex flex-col">
        <Header toggleSidebar={toggleSidebar}/>

        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar}/>

        <main className="flex-1 p-6 bg-gray-100">
          <h1 className="text-2xl font-bold">Welcome!</h1>
          <p>This is the main homepage content.</p>
        </main>


        <Footer />
    </div>
  );
};

export default Home;
