import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import { apiCache } from "../../utils/apiCache";

const Explore = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query');
  const [popularBooks, setPopularBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    // Eş zamanlı olarak hem popüler kitapları hem de kategorileri çek
    Promise.all([
      fetchPopularBooks(),
      fetchCategories()
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (query) {
      searchBooks(query);
    } else {
      setSearchResults([]);
    }
  }, [query]);

  const fetchPopularBooks = async () => {
    const cacheKey = 'most-reads-6';
    
    // Önce cache'den kontrol et
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      setPopularBooks(cachedData);
      return;
    }

    try {
      const res = await axios.post("/api/books/discover/most-reads", { limit: 6 });
      if (res.data?.status?.code === "0") {
        const books = res.data.books || [];
        setPopularBooks(books);
        apiCache.set(cacheKey, books);
      }
    } catch (err) {
      console.error("Popular books API error:", err.response?.data || err.message);
    }
  };

  const fetchCategories = async () => {
    const cacheKey = 'book-genres';
    
    // Önce cache'den kontrol et
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      setCategories(cachedData);
      return;
    }

    try {
      // Backend'ten mevcut genre'ları çek
      const res = await axios.get("/api/books/genres", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      let genres = [];
      
      if (res.data?.status?.code === "0" && Array.isArray(res.data.genres)) {
        genres = res.data.genres;
      } else if (Array.isArray(res.data)) {
        genres = res.data;
      } else {
        // Backend'te genres endpoint'i yoksa gerçek genre listesini kullan
        genres = [
          "Dystopian",
          "Southern Gothic", 
          "Historical Fiction",
          "Science Fiction",
          "Coming-of-Age",
          "Classic",
          "Adventure",
          "Fantasy",
          "Children's",
          "Allegorical Fiction",
          "Young Adult",
          "Mystery",
          "Crime",
          "Classic Chinese Literature",
          "Thriller",
          "Magic Realism"
        ];
      }

      // Benzersiz genre'ları filtrele ve alfabetik sırala
      const uniqueGenres = [...new Set(genres)].sort();

      // Cache'e kaydet ve state'i güncelle
      apiCache.set(cacheKey, uniqueGenres);
      setCategories(uniqueGenres);
      
    } catch (err) {
      // Hata durumunda gerçek genre listesi
      const fallbackCategories = [
        "Adventure",
        "Allegorical Fiction", 
        "Children's",
        "Classic",
        "Classic Chinese Literature",
        "Coming-of-Age",
        "Crime",
        "Dystopian",
        "Fantasy",
        "Historical Fiction",
        "Magic Realism",
        "Mystery",
        "Science Fiction",
        "Southern Gothic",
        "Thriller",
        "Young Adult"
      ];
      setCategories(fallbackCategories);
    }
  };

  const searchBooks = async (searchQuery) => {
    setSearchLoading(true);
    
    try {
      const response = await axios.post("/api/books/search", {
        query: searchQuery,
        limit: 20
      }, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = response.data;
      
      if (data.status?.code === "0" && Array.isArray(data.books)) {
        setSearchResults(data.books);
      } else if (Array.isArray(data)) {
        setSearchResults(data);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Kitap kapağı için akıllı resim seçimi - useCallback ile optimize et
  const getBookImage = useCallback((book) => {
    // Önce base64 resim var mı kontrol et
    if (book.image_base64 && book.image_base64.startsWith('data:image/')) {
      return book.image_base64;
    }
    
    // API'den gelen normal URL resim varsa onu kullan
    if (book.image_url && book.image_url !== "" && !book.image_url.includes("placeholder")) {
      return book.image_url;
    }
    if (book.image && book.image !== "" && !book.image.includes("placeholder")) {
      return book.image;
    }
    if (book.cover_image && book.cover_image !== "" && !book.cover_image.includes("placeholder")) {
      return book.cover_image;
    }
    
    // Gerçek resim yoksa placeholder kullan
    return "/images/book-placeholder.png";
  }, []);

  // Kitap kapağı elementi oluştur - useCallback ile optimize et
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

  const renderSearchBookCard = (book) => {
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

  return (
    <div
      className="relative min-h-screen bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/images/explore.png')" }}
    >
      <div className="absolute inset-0 bg-black/70 z-0"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 space-y-16">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            {query ? 'Search Results' : 'Explore Books'}
          </h1>
          <p className="text-lg text-white/80">
            {query 
              ? `Results for "${query}"${searchResults.length > 0 ? ` • ${searchResults.length} books found` : ''}`
              : 'Discover trending reads, curated categories and what others are loving.'
            }
          </p>
        </div>

        {/* 🔍 Search Results */}
        {query && (
          <section>
            <h2 className="text-2xl font-bold mb-6">🔍 Search Results</h2>
            
            {searchLoading && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4 animate-bounce">🔍</div>
                <p className="text-lg">Searching for "{query}"...</p>
              </div>
            )}

            {!searchLoading && searchResults.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-xl font-bold mb-2">No Books Found</h3>
                <p className="text-white/70">
                  No books match your search for "{query}". Try different keywords.
                </p>
              </div>
            )}

            {!searchLoading && searchResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map(renderSearchBookCard)}
              </div>
            )}
          </section>
        )}

        {/* Sadece arama yapılmıyorsa diğer bölümleri göster */}
        {!query && (
          <>
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
                        <div className="w-full h-80 bg-white/20 rounded-md mb-4"></div>
                        <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-white/10 rounded w-1/2"></div>
                      </div>
                    ))
                  : popularBooks.length > 0
                  ? popularBooks.map((book, index) => (
                      <Link
                        key={book.id || book._id || index}
                        to={`/book/details?id=${book.id || book._id}`}
                        className="bg-white/10 backdrop-blur-md p-4 rounded-xl shadow hover:scale-105 transition-transform"
                      >
                        {renderBookCover(book)}
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
                {loading 
                  ? [...Array(6)].map((_, index) => (
                      <div
                        key={index}
                        className="bg-white/10 backdrop-blur-md p-4 text-center rounded-lg animate-pulse"
                      >
                        <div className="h-4 bg-white/20 rounded w-3/4 mx-auto"></div>
                      </div>
                    ))
                  : categories.map((cat, index) => (
                      <Link
                        key={index}
                        to={`/category/${cat.toLowerCase()}`}
                        className="bg-white/10 backdrop-blur-md p-4 text-center rounded-lg font-medium hover:bg-white/20 transition capitalize"
                      >
                        {cat}
                      </Link>
                    ))
                }
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
          </>
        )}
      </div>
    </div>
  );
};

export default Explore;
