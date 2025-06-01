import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) {
      setError("No search query provided");
      setLoading(false);
      return;
    }

    searchBooks(query);
  }, [query]);

  const searchBooks = async (searchQuery) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("🔍 Searching for:", searchQuery);
      
      // Core backend search endpoint'ini kullan
      const response = await axios.post("/api/books/search", {
        query: searchQuery,
        limit: 20
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("📚 Search Response:", response.data);

      const data = response.data;
      
      if (data.status?.code === "0" && Array.isArray(data.books)) {
        setBooks(data.books);
      } else if (Array.isArray(data)) {
        setBooks(data);
      } else {
        setBooks([]);
      }
    } catch (err) {
      console.error("❌ Search Error:", err);
      setError("Failed to search books. Please try again.");
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const getBookImage = (book) => {
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
  };

  const renderBookCard = (book) => {
    const imageUrl = getBookImage(book);
    const hasRealImage = imageUrl !== "/images/book-placeholder.png";

    return (
      <Link
        key={book._id || book.id}
        to={`/book/details?id=${book._id || book.id}`}
        className="group block bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300 hover:scale-105"
      >
        <div className="flex gap-4">
          {/* Book Cover */}
          <div className="relative w-16 h-24 rounded overflow-hidden flex-shrink-0">
            {hasRealImage ? (
              <img
                src={imageUrl}
                alt={book.title || "Book"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 flex items-center justify-center text-white text-xs font-bold text-center p-1">
                {book.title || "?"}
              </div>
            )}
          </div>

          {/* Book Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm group-hover:text-blue-300 transition-colors line-clamp-2">
              {book.title || "Unknown Title"}
            </h3>
            <p className="text-white/70 text-xs mt-1">
              {book.author || "Unknown Author"}
            </p>
            {book.published_year && (
              <p className="text-white/60 text-xs mt-1">
                {book.published_year}
              </p>
            )}
            {book.rating && (
              <div className="flex items-center gap-1 mt-2">
                <span className="text-yellow-400 text-xs">
                  {"★".repeat(Math.floor(book.rating))}
                  {"☆".repeat(5 - Math.floor(book.rating))}
                </span>
                <span className="text-white/60 text-xs">({book.rating})</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2a1a0f] text-white pt-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="text-4xl mb-4 animate-bounce">🔍</div>
            <p className="text-lg">Searching for "{query}"...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center text-white pt-20"
      style={{ backgroundImage: "url('/images/book-bg.png')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 z-0" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Search Results
          </h1>
          <p className="text-white/80">
            {query ? `Results for "${query}"` : "No search query"}
            {books.length > 0 && ` • ${books.length} books found`}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">😞</div>
            <h2 className="text-xl font-bold mb-2">Search Error</h2>
            <p className="text-white/70 mb-4">{error}</p>
            <button 
              onClick={() => searchBooks(query)}
              className="bg-blue-500/20 hover:bg-blue-500/30 px-4 py-2 rounded-lg transition"
            >
              🔄 Try Again
            </button>
          </div>
        )}

        {/* No Results */}
        {!error && !loading && books.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📚</div>
            <h2 className="text-xl font-bold mb-2">No Books Found</h2>
            <p className="text-white/70 mb-4">
              No books match your search for "{query}". Try different keywords.
            </p>
            <Link 
              to="/explore"
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition inline-block"
            >
              Browse All Books
            </Link>
          </div>
        )}

        {/* Results Grid */}
        {!error && !loading && books.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map(renderBookCard)}
          </div>
        )}

        {/* Back to Search */}
        <div className="mt-8 text-center">
          <Link 
            to="/explore"
            className="text-white/60 hover:text-white transition"
          >
            ← Back to Browse
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SearchResults; 