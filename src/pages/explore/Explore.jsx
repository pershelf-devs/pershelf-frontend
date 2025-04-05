import React from "react";

const Explore = () => {
  const popularBooks = [
    { title: "1984", author: "George Orwell", image: "https://covers.openlibrary.org/b/id/7222246-L.jpg"},
    { title: "The Book Thief", author: "Markus Zusak",image: "//covers.openlibrary.org/b/id/12915081-M.jpg"},
    { title: "Sapiens", author: "Yuval Noah Harari",image: "//covers.openlibrary.org/b/id/14854278-M.jpg"},
  ];

  const categories = ["Fiction", "Non-Fiction", "Science", "History", "Biography", "Fantasy"];

  const recommendations = [
    {
      user: "Ayşe",
      quote: "This platform helped me rebuild my reading habit!",
    },
    {
      user: "Emre",
      quote: "Packed with great recommendations. There’s something for everyone.",
    },
    {
      user: "Zeynep",
      quote: "Creating book lists has never been easier!",
    },
  ];

  return (
    <div
      className="min-h-screen bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/images/explore.png')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 z-0"></div>

      {/* İçerik */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 space-y-16">

        {/* Başlık */}
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
            {popularBooks.map((book, index) => (
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

        {/* Kitap Kategorileri */}
        <section>
        <h2 className="text-2xl font-bold mb-6">🗂️ Book Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md p-4 text-center rounded-lg font-medium hover:bg-white/20 transition"
              >
                {cat}
              </div>
            ))}
          </div>
        </section>

        {/* Kullanıcı Tavsiyeleri */}
        <section>
        <h2 className="text-2xl font-bold mb-6">💬 User Recommendations</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {recommendations.map((rec, index) => (
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
