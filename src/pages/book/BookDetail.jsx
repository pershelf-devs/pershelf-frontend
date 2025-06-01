import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

const BookDetail = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError("No book ID provided in URL parameters");
      setLoading(false);
      return;
    }

    // Tüm ID türleri için core backend'i kullan
    fetchFromCoreBackend(id);
  }, [id]);

  const fetchFromCoreBackend = useCallback((bookId) => {
    setLoading(true);
    
    const requestUrl = `/restapi/v1.0/books/${bookId}`;
    console.log("🚀 Starting Core Backend Request:", {
      url: requestUrl,
      bookId: bookId,
      bookIdType: typeof bookId,
      timestamp: new Date().toISOString()
    });
    
    // Core backend book detail endpoint - /restapi/v1.0 path kullan
    axios
      .get(requestUrl)
      .then(res => {
        console.log("✅ Core Backend Success Response:", {
          status: res.status,
          statusText: res.statusText,
          headers: res.headers,
          fullResponse: res,
          data: res.data,
          dataType: typeof res.data,
          dataKeys: res.data ? Object.keys(res.data) : 'No keys',
          dataLength: res.data ? JSON.stringify(res.data).length : 0,
          hasStatus: res.data?.status ? true : false,
          statusCode: res.data?.status?.code,
          hasBook: res.data?.book ? true : false,
          hasData: res.data?.data ? true : false,
          timestamp: new Date().toISOString()
        });

        // Response data structure'ını detaylı incele
        if (res.data) {
          console.log("📊 Response Data Analysis:", {
            topLevelKeys: Object.keys(res.data),
            statusExists: 'status' in res.data,
            statusValue: res.data.status,
            bookExists: 'book' in res.data,
            bookValue: res.data.book,
            dataExists: 'data' in res.data,
            dataValue: res.data.data,
            directBookData: res.data
          });
        }

        if (res.data?.status?.code === "0") {
          const bookData = res.data.book || res.data.data;
          console.log("📖 Setting Book Data:", bookData);
          setBook(bookData);
        } else if (res.data && !res.data.status) {
          // Status field yoksa direkt data'yı kitap olarak kabul et
          console.log("📖 No status field, using direct data as book:", res.data);
          setBook(res.data);
        } else {
          console.log("❌ Book not found - status check failed:", {
            hasStatus: !!res.data?.status,
            statusCode: res.data?.status?.code,
            responseData: res.data
          });
          setError("Book not found in core backend");
        }
      })
      .catch(err => {
        console.error("💥 Core Backend Error Details:", {
          message: err.message,
          responseStatus: err.response?.status,
          responseStatusText: err.response?.statusText,
          responseData: err.response?.data,
          responseHeaders: err.response?.headers,
          requestConfig: err.config,
          errorCode: err.code,
          fullError: err,
          timestamp: new Date().toISOString()
        });
        
        // Backend endpoint henüz yoksa daha friendly bir mesaj göster
        if (err.response?.status === 404 || err.code === 'ERR_BAD_REQUEST') {
          setError("Book details will be available soon. Backend endpoint is being developed.");
        } else {
          setError("Failed to load book details from core backend. Please try again.");
        }
      })
      .finally(() => {
        setLoading(false);
        console.log("🏁 Request completed, loading set to false");
      });
  }, []);

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
    if (book.cover_image && book.cover_image !== "" && !book.cover_image.includes("placeholder")) {
      return book.cover_image;
    }
    if (book.image && book.image !== "" && !book.image.includes("placeholder")) {
      return book.image;
    }
    
    // Gerçek resim yoksa placeholder kullan
    return "/images/book-placeholder.png";
  }, []);

  // Kitap kapağı elementi oluştur - useCallback ile optimize et  
  const renderBookCover = useCallback((book) => {
    const imageUrl = getBookImage(book);
    const hasRealImage = imageUrl !== "/images/book-placeholder.png";

    return (
      <div className="relative w-48 h-72 rounded shadow-lg overflow-hidden">
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
            <div className="absolute top-3 left-3 w-8 h-8 border-2 border-white/30 rounded"></div>
            <div className="absolute bottom-3 right-3 w-6 h-6 border border-white/30 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 border border-white/20 rounded-full"></div>
          </div>
          
          {/* Kitap başlığı */}
          <div className="relative z-10 flex-1 flex items-center justify-center">
            <h3 className="text-lg font-bold leading-tight text-center line-clamp-4">
              {book.title || "Unknown Title"}
            </h3>
          </div>
          
          {/* Yazar adı */}
          <div className="relative z-10 mt-auto">
            <div className="h-px bg-white/30 mb-3"></div>
            <p className="text-sm opacity-90 font-medium text-center">
              {book.author || "Unknown Author"}
            </p>
          </div>
        </div>
      </div>
    );
  }, [getBookImage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2a1a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">📚</div>
          <p className="text-lg">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-[#2a1a0f] text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">
            {error?.includes("will be available soon") ? "🚧" : "😞"}
          </div>
          <h2 className="text-xl font-bold mb-2">
            {error?.includes("will be available soon") ? "Coming Soon" : "Book Not Found"}
          </h2>
          <p className="text-white/70 mb-4 leading-relaxed">
            {error || "The book you're looking for doesn't exist."}
          </p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => window.history.back()}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
            >
              ← Go Back
            </button>
            {error?.includes("will be available soon") && (
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-500/20 hover:bg-blue-500/30 px-4 py-2 rounded-lg transition"
              >
                🔄 Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/images/book-bg.png')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 z-0" />

      {/* İçerik */}
      <div className="relative z-10 py-20 px-6 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-10 items-start">
          {/* Poster */}
          {renderBookCover(book)}

          {/* Kitap Bilgileri */}
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold">{book.title || "Unknown Title"}</h1>
            <p className="text-white/70 text-sm">
              by {book.author || "Unknown Author"}
              {(book.published_year || book.year) && ` • ${book.published_year || book.year}`}
            </p>

            {/* Rating */}
            {book.rating && (
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-lg">
                  {"★".repeat(Math.floor(book.rating))}
                  {"☆".repeat(5 - Math.floor(book.rating))}
                </span>
                <span className="text-white/80 text-sm">({book.rating}/5)</span>
              </div>
            )}

            {/* Read Count */}
            {book.reads !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-blue-400">📖</span>
                <span className="text-white/80 text-sm">{book.reads.toLocaleString()} reads</span>
              </div>
            )}

            {/* ISBN */}
            {book.isbn && (
              <p className="text-white/60 text-sm">ISBN: {book.isbn}</p>
            )}

            {/* Publisher */}
            {book.publisher && (
              <p className="text-white/60 text-sm">Publisher: {book.publisher}</p>
            )}

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Description</h3>
              <p className="text-white/90 leading-relaxed">
                {book.description || book.summary || "No description available for this book."}
              </p>
            </div>

            {/* Tags/Genres */}
            {book.genre && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Genre</h3>
                <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm">
                  {book.genre}
                </span>
              </div>
            )}

            {/* Publication Info */}
            {(book.created_at || book.updated_at) && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Publication Info</h3>
                <div className="space-y-1 text-sm text-white/70">
                  {book.created_at && (
                    <p>Added: {new Date(book.created_at).toLocaleDateString()}</p>
                  )}
                  {book.updated_at && book.updated_at !== book.created_at && (
                    <p>Updated: {new Date(book.updated_at).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            )}

            {/* Butonlar */}
            <div className="flex gap-4 mt-6">
              <button className="bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded-full transition">
                ❤️ Like
              </button>
              <button className="bg-blue-500/20 hover:bg-blue-500/30 px-4 py-2 rounded-full transition">
                ➕ Add to Reading List
              </button>
              <button className="bg-green-500/20 hover:bg-green-500/30 px-4 py-2 rounded-full transition">
                ✍️ Write Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
