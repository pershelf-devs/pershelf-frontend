import { Link } from "react-router-dom";

export default function HeroSection() {
    return (
      <div
        className="relative h-screen bg-cover bg-center"
        style={{ backgroundImage: "url('/images/homepage.png')" }}
      >
  
        <div className="relative z-10 h-full flex items-center px-10">
          <div className="bg-black/40 backdrop-blur-md p-8 rounded-xl shadow-xl max-w-xl text-left text-white">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              Discover your next favorite book.
            </h1>
            <p className="text-lg md:text-xl mb-6 text-white/80">
              Curate your personal reading shelf. Let your bookshelf tell your story.
            </p>
            <Link
                to="/register"
                className="border border-white text-white hover:bg-white hover:text-black transition-all px-6 py-3 rounded-full font-semibold inline-block"
                >
                Join Pershelf
            </Link>
          </div>
        </div>
      </div>
    );
  }
  