import React from "react";
import HeroSection from "./HeroSection"; 

const Home = () => {
  return (
    <div>
      <HeroSection />
      {/* Alt kısımlara başka bölümler de ekleyebilirsin */}
      <section className="bg-white text-black py-12 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">What is Pershelf?</h2>
        <p className="max-w-2xl mx-auto text-lg">
          Pershelf helps you track your reading journey, discover books, and connect with fellow readers. Whether you're building your personal library or exploring new titles, Pershelf is your home for books.
        </p>
      </section>
    </div>
  );
};

export default Home;
