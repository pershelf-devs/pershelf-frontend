import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const BookDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError("No book ID provided");
      setLoading(false);
      return;
    }

    console.log("Fetching book details for ID:", id);

    // ID türüne göre farklı backend endpoint'leri dene
    const isNumericId = /^\d+$/.test(id);
    
    if (isNumericId) {
      // Helper backend'ten kitap detayını çek (integer ID)
      fetchFromHelperBackend(parseInt(id));
    } else {
      // Core backend'ten kitap detayını çek (MongoDB ObjectID)
      fetchFromCoreBackend(id);
    }
  }, [id]);

  const fetchFromHelperBackend = (numericId) => {
    axios
      .post(`/api/books/get/id/${numericId}`)
      .then(res => {
        console.log("Helper backend book detail response:", res.data);
        
        if (res.data && res.data.id) {
          setBook(res.data);
        } else {
          setError("Book not found");
        }
      })
      .catch(err => {
        console.error("Helper backend book detail error:", err);
        setError("Failed to load book details from helper backend");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchFromCoreBackend = (objectId) => {
    // Core backend book detail endpoint (gelecekte eklenecek)
    axios
      .post(`/api/books/detail/${objectId}`)
      .then(res => {
        console.log("Core backend book detail response:", res.data);
        
        if (res.data?.status?.code === "0") {
          setBook(res.data.book || res.data.data);
        } else {
          setError("Book not found in core backend");
        }
      })
      .catch(err => {
        console.error("Core backend book detail error:", err);
        // Backend endpoint henüz yoksa daha friendly bir mesaj göster
        if (err.response?.status === 404 || err.code === 'ERR_BAD_REQUEST') {
          setError("Book details will be available soon. Backend endpoint is being developed.");
        } else {
          setError("Failed to load book details from core backend");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

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
          <img
            src={book.image_url || book.cover_image || book.image || "/images/book-placeholder.png"}
            alt={book.title || "Book"}
            className="w-48 h-72 object-cover rounded shadow-lg"
            onError={(e) => {
              if (e.target.src !== window.location.origin + "/images/book-placeholder.png") {
                e.target.src = "/images/book-placeholder.png";
              }
            }}
          />

          {/* Kitap Bilgileri */}
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold">{book.title || "Unknown Title"}</h1>
            <p className="text-white/70 text-sm">
              by {book.author || "Unknown Author"}
              {book.published_year && ` • ${book.published_year}`}
              {book.year && ` • ${book.year}`}
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
