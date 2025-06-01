import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Explore = () => {
  const [popularBooks, setPopularBooks] = useState([]);
  const [loading, setLoading] = useState(true);
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
    axios
      .post("/api/books/discover/most-reads", { limit: 6 })
      .then(res => {
        if (res.data?.status?.code === "0") {
          const books = res.data.books || [];
          console.log("📚 API'den gelen kitaplar:", books);
          books.forEach((book, index) => {
            console.log(`📖 Kitap ${index + 1}:`, {
              title: book.title,
              image_url: book.image_url,
              image: book.image,
              cover_image: book.cover_image,
              image_base64: book.image_base64 ? `Base64 var (${book.image_base64.substring(0, 50)}...)` : 'Base64 yok'
            });
          });
          setPopularBooks(books);
        }
      })
      .catch(err => {
        console.error("API error:", err.response?.data || err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  // Kitap kapağı için akıllı resim seçimi
  const getBookImage = (book) => {
    // Önce base64 resim var mı kontrol et
    if (book.image_base64 && book.image_base64.startsWith('data:image/')) {
      console.log(`📸 Base64 resim kullanılıyor: ${book.title}`);
      return book.image_base64;
    }
    
    // API'den gelen normal URL resim varsa onu kullan
    if (book.image_url && book.image_url !== "" && !book.image_url.includes("placeholder")) {
      console.log(`🌐 URL resim kullanılıyor: ${book.title} - ${book.image_url}`);
      return book.image_url;
    }
    if (book.image && book.image !== "" && !book.image.includes("placeholder")) {
      console.log(`🖼️ Image field kullanılıyor: ${book.title} - ${book.image}`);
      return book.image;
    }
    if (book.cover_image && book.cover_image !== "" && !book.cover_image.includes("placeholder")) {
      console.log(`📚 Cover image kullanılıyor: ${book.title} - ${book.cover_image}`);
      return book.cover_image;
    }
    
    // Gerçek resim yoksa placeholder kullan
    console.log(`🎨 Özel tasarım kullanılacak: ${book.title}`);
    return "/images/book-placeholder.png";
  };

  // Kitap kapağı elementi oluştur (resim yoksa güzel bir kart tasarımı)
  const renderBookCover = (book, className) => {
    const imageUrl = getBookImage(book);
    const hasRealImage = imageUrl !== "/images/book-placeholder.png";

    return (
      <div className="relative w-full h-64 rounded-md mb-4">
        {/* Gerçek resim */}
        <img
          src={imageUrl}
          alt={book.title || "Book"}
          className={`${className} ${hasRealImage ? 'block' : 'hidden'}`}
          onError={(e) => {
            // Gerçek resim yüklenemezse özel tasarım göster
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        
        {/* Özel kitap kapağı tasarımı (fallback) */}
        <div 
          className={`${className} ${hasRealImage ? 'hidden' : 'flex'} bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 flex-col justify-between p-4 text-white relative overflow-hidden`}
          style={{ display: hasRealImage ? 'none' : 'flex' }}
        >
          {/* Arka plan deseni */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 left-2 w-8 h-8 border-2 border-white/30 rounded"></div>
            <div className="absolute bottom-2 right-2 w-6 h-6 border border-white/30 rounded-full"></div>
          </div>
          
          {/* Kitap başlığı */}
          <div className="relative z-10">
            <h3 className="text-sm font-bold leading-tight mb-2 line-clamp-3">
              {book.title || "Unknown Title"}
            </h3>
          </div>
          
          {/* Yazar adı */}
          <div className="relative z-10 mt-auto">
            <p className="text-xs opacity-80 font-medium">
              {book.author || "Unknown Author"}
            </p>
          </div>
          
          {/* Dekoratif çizgi */}
          <div className="absolute bottom-8 left-4 right-4 h-px bg-white/30"></div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="relative min-h-screen bg-cover bg-center text-white"
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

        {/* 📚 Most Read Books */}
        <section>
          <h2 className="text-2xl font-bold mb-6">📚 Most Read Books</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {loading
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
              : popularBooks.length > 0
              ? popularBooks.map((book, index) => (
                  <Link
                    key={book._id || index}
                    to={`/book/${book._id}`}
                    className="bg-white/10 backdrop-blur-md p-4 rounded-xl shadow hover:scale-105 transition-transform"
                  >
                    {renderBookCover(book, "w-full h-64 object-cover")}
                    <h3 className="text-lg font-semibold">{book.title || "Unknown Title"}</h3>
                    <p className="text-sm text-white/70">by {book.author || "Unknown Author"}</p>
                    {book.rating && (
                      <div className="mt-2 flex items-center">
                        <span className="text-yellow-400 text-sm">
                          {"★".repeat(Math.floor(book.rating))}
                          {"☆".repeat(5 - Math.floor(book.rating))}
                        </span>
                        <span className="text-white/60 text-xs ml-1">({book.rating})</span>
                      </div>
                    )}
                  </Link>
                ))
              : (
                <div className="col-span-full text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-semibold mb-2">No books found</h3>
                  <p className="text-white/70">Check back later for popular books!</p>
                </div>
              )}
          </div>
        </section>

        {/* 🗂️ Book Categories */}
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

        {/* 💬 User Recommendations */}
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
                    "{rec.quote}"
                    <div className="mt-3 text-right font-semibold text-white/60">
                      – {rec.user}
                    </div>
                  </div>
                ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Explore;
