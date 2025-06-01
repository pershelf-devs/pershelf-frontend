import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const Category = () => {
  const { name } = useParams(); // URL'den kategori adını al
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (name) {
      fetchBooksByGenre(name);
    }
  }, [name]);

  const fetchBooksByGenre = async (genre) => {
    setLoading(true);
    setError(null);
    
    // Genre'yi proper case'e çevir (her kelimenin ilk harfi büyük)
    const capitalizedGenre = genre
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    try {
      // Backend'ten o genre'a ait kitapları çek - capitalize edilmiş string gönder
      const response = await axios.post("/api/books/get/by-genre", capitalizedGenre, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = response.data;
      
      if (data.status?.code === "0" && Array.isArray(data.books)) {
        setBooks(data.books);
      } else if (Array.isArray(data)) {
        setBooks(data);
      } else if (data.books && Array.isArray(data.books)) {
        setBooks(data.books);
      } else {
        setBooks([]);
      }
    } catch (err) {
      setError("Failed to load books for this category. Please try again.");
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const getBookImage = useCallback((book) => {
    if (book.image_base64 && book.image_base64.startsWith('data:image/')) {
      return book.image_base64;
    }
    if (book.image_url && book.image_url !== "" && !book.image_url.includes("placeholder")) {
      return book.image_url;
    }
    if (book.cover_image && book.cover_image !== "" && !book.cover_image.includes("placeholder")) {
      return book.cover_image;
    }
    if (book.image && book.image !== "" && !book.image.includes("placeholder")) {
      return book.image;
    }
    return "/images/book-placeholder.png";
  }, []);

  // Kitap kapağı elementi oluştur - Explore'daki gibi
  const renderBookCover = useCallback((book) => {
    const imageUrl = getBookImage(book);
    const hasRealImage = imageUrl !== "/images/book-placeholder.png";

    return (
      <div className="relative w-full h-80 rounded-md mb-4 overflow-hidden">
        {/* Gerçek resim */}
        <img
          src={imageUrl}
          alt={book.title || "Book"}
          className={`w-full h-full object-contain bg-gradient-to-br from-gray-800 to-gray-900 ${hasRealImage ? 'block' : 'hidden'}`}
          onError={(e) => {
            // Gerçek resim yüklenemezse özel tasarım göster
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        
        {/* Özel kitap kapağı tasarımı (fallback) */}
        <div 
          className={`w-full h-full ${hasRealImage ? 'hidden' : 'flex'} bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 flex-col justify-between p-6 text-white relative overflow-hidden`}
          style={{ display: hasRealImage ? 'none' : 'flex' }}
        >
          {/* Arka plan deseni */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-3 left-3 w-10 h-10 border-2 border-white/30 rounded"></div>
            <div className="absolute bottom-3 right-3 w-8 h-8 border border-white/30 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-white/20 rounded-full"></div>
          </div>
          
          {/* Kitap başlığı */}
          <div className="relative z-10 flex-1 flex items-center justify-center">
            <h3 className="text-lg font-bold leading-tight text-center line-clamp-4">
              {book.title || "Unknown Title"}
            </h3>
          </div>
          
          {/* Yazar adı */}
          <div className="relative z-10 mt-auto">
            <div className="h-px bg-white/30 mb-4"></div>
            <p className="text-sm opacity-90 font-medium text-center">
              {book.author || "Unknown Author"}
            </p>
          </div>
        </div>
      </div>
    );
  }, [getBookImage]);

  const renderBookCard = (book) => {
    return (
      <Link
        key={book._id || book.id}
        to={`/book/details?id=${book._id || book.id}`}
        className="group bg-white/10 backdrop-blur-md p-4 rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105"
      >
        {/* Book Cover - Explore mantığı ile */}
        {renderBookCover(book)}

        {/* Book Info */}
        <div>
          <h3 className="text-white font-semibold text-lg group-hover:text-blue-300 transition-colors line-clamp-2 mb-2">
            {book.title || "Unknown Title"}
          </h3>
          <p className="text-white/70 text-sm mb-2">
            by {book.author || "Unknown Author"}
          </p>
          
          {/* Genre Badge */}
          {book.genre && (
            <span className="inline-block bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded mb-2">
              {book.genre}
            </span>
          )}
          
          {book.published_year && (
            <p className="text-white/60 text-sm mb-2">
              {book.published_year}
            </p>
          )}
          
          {book.rating && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-400 text-sm">
                {"★".repeat(Math.floor(book.rating))}
                {"☆".repeat(5 - Math.floor(book.rating))}
              </span>
              <span className="text-white/60 text-sm">({book.rating})</span>
            </div>
          )}
        </div>
      </Link>
    );
  };

  if (loading) {
    return (
      <div 
        className="relative min-h-screen bg-cover bg-center text-white"
        style={{ backgroundImage: "url('/images/category-bg.png')" }}
      >
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-black/70 z-0" />
        
        <div className="relative z-10 px-8 py-20">
          <h1 className="text-4xl font-bold mb-4 capitalize">{name} Books</h1>
          <div className="text-center py-12">
            <div className="text-4xl mb-4 animate-bounce">📚</div>
            <p className="text-lg">Loading {name} books...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative min-h-screen bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/images/category-bg.png')" }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/70 z-0" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-8 py-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 capitalize">{name} Books</h1>
          <p className="text-white/70">
            {books.length > 0 
              ? `${books.length} books found in ${name} category`
              : `All books listed under "${name}" category will appear here.`
            }
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">😞</div>
            <h2 className="text-xl font-bold mb-2">Error Loading Books</h2>
            <p className="text-white/70 mb-4">{error}</p>
            <button 
              onClick={() => fetchBooksByGenre(name)}
              className="bg-blue-500/20 hover:bg-blue-500/30 px-4 py-2 rounded-lg transition"
            >
              🔄 Try Again
            </button>
          </div>
        )}

        {/* No Books */}
        {!error && !loading && books.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📚</div>
            <h2 className="text-xl font-bold mb-2">No Books Found</h2>
            <p className="text-white/70 mb-4">
              No books found in the "{name}" category yet.
            </p>
          </div>
        )}

        {/* Books Grid */}
        {!error && !loading && books.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map(renderBookCard)}
          </div>
        )}

        {/* Back Navigation */}
        <div className="mt-8 text-center">
          <Link 
            to="/explore"
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition inline-block"
          >
            ← Back to Explore
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Category;
