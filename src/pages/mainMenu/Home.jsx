import React from "react";
import HeroSection from "./HeroSection"; 

const Home = () => {
  return (
    <div>
      <HeroSection />
      {/* What is Pershelf section with book-themed styling */}
      <section className="bg-gradient-to-b from-[#2a1a0f] to-[#3b2316] text-white py-16 px-6 relative">
        {/* Subtle book pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#f4e4c1]">
              What is <span className="text-[#d4af37]">Pershelf</span>?
            </h2>
            <div className="w-24 h-1 bg-[#d4af37] mx-auto mb-8"></div>
          </div>
          
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-[#d4af37]/20">
            <p className="text-xl md:text-2xl leading-relaxed text-[#f4e4c1] mb-8">
              Pershelf helps you track your reading journey, discover books, and connect with fellow readers. Whether you're building your personal library or exploring new titles, Pershelf is your home for books.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#d4af37]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📚</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[#f4e4c1]">Track Reading</h3>
                <p className="text-[#e0d5b7] text-sm">Monitor your reading progress and build your personal library</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-[#d4af37]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[#f4e4c1]">Discover Books</h3>
                <p className="text-[#e0d5b7] text-sm">Find your next favorite read with personalized recommendations</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-[#d4af37]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👥</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[#f4e4c1]">Connect</h3>
                <p className="text-[#e0d5b7] text-sm">Share reviews and connect with fellow book lovers</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
