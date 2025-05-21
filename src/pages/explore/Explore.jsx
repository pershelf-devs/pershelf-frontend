import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Explore = () => {
  const [popularBooks, setPopularBooks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const categories = [
    "Fiction",
    "Non-Fiction",
    "Science",
    "History",
    "Biography",
    "Fantasy"
  ];

  useEffect(() => {
    // API çağrıları burada olacak
    // axios.get("/api/books/popular").then(res => setPopularBooks(res.data));
    // axios.get("/api/recommendations").then(res => setRecommendations(res.data));
  }, []);

  return (
    <div
      className="min-h-screen bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/images/explore.png')" }}
    >
      <div className="absolute inset-0 bg-black/70 z-0"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 space-y-16">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Explore Books</h1>
          <p className="text-lg text-white/80">
            Discover trending reads, curated categories and what others are loving.
          </p>
        </div>

        {/* En Çok Okunanlar */}
        <section>
          <h2 className="text-2xl font-bold mb-6">📚 Most Read Books</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {popularBooks.length === 0
              ? [...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-md p-4 rounded-xl shadow animate-pulse"
                  >
                    <div className="w-full h-64 bg-white/20 rounded-md mb-4"></div>
                    <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-white/10 rounded w-1/2"></div>
                  </div>
                ))
              : popularBooks.map((book, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-md p-4 rounded-xl shadow hover:scale-105 transition-transform"
                  >
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-full h-64 object-cover rounded-md mb-4"
                    />
                    <h3 className="text-lg font-semibold">{book.title}</h3>
                    <p className="text-sm text-white/70">by {book.author}</p>
                  </div>
                ))}
          </div>
        </section>

        {/* Kitap Kategorileri (statik olarak kalıyor) */}
        <section>
          <h2 className="text-2xl font-bold mb-6">🗂️ Book Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat, index) => (
              <Link
                key={index}
                to={`/category/${cat.toLowerCase()}`}
                className="bg-white/10 backdrop-blur-md p-4 text-center rounded-lg font-medium hover:bg-white/20 transition capitalize"
              >
                {cat}
              </Link>
            ))}
          </div>
        </section>

        {/* Kullanıcı Tavsiyeleri */}
        <section>
          <h2 className="text-2xl font-bold mb-6">💬 User Recommendations</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {recommendations.length === 0
              ? [...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-md p-5 rounded-xl text-sm italic text-white/90 animate-pulse"
                  >
                    <div className="h-4 bg-white/20 rounded w-full mb-3"></div>
                    <div className="h-4 bg-white/20 rounded w-5/6 mb-2"></div>
                    <div className="h-4 bg-white/10 rounded w-2/3"></div>
                    <div className="mt-3 text-right font-semibold text-white/60">
                      <div className="h-3 w-1/4 bg-white/20 rounded inline-block"></div>
                    </div>
                  </div>
                ))
              : recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-md p-5 rounded-xl text-sm italic text-white/90"
                  >
                    “{rec.quote}”
                    <div className="mt-3 text-right font-semibold text-white/60">– {rec.user}</div>
                  </div>
                ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Explore;
