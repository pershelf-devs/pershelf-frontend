import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { api } from "../../api/api";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

// ReviewCard bileşeni
const ReviewCard = ({ review }) => {
  const { t } = useTranslation(); 
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    const months = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];

    if (diffInMins < 60) {
      return `${diffInMins} ` + t('minutes_ago');
    } else if (diffInHours < 24) {
      return `${diffInHours} ` + t('hours_ago');
    } else if (diffInDays < 7) {
      return `${diffInDays} ` + t('days_ago');
    } else {
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {review?.user_image_base64 ? (
            <img 
              src={review?.user_image_base64} 
              alt={review?.username} 
              className="w-10 h-10 rounded-full object-cover border border-white/20"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <span className="text-lg">👤</span>
            </div>
          )}
          <div>
            <h4 className="font-semibold">{review?.username}</h4>
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">
                {"★".repeat(Math.floor(review?.rating))}
                {"☆".repeat(5 - Math.floor(review?.rating))}
              </span>
              <span className="text-white/60 text-sm">
                {formatDate(review?.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <h5 className="font-medium text-lg mb-2">{review?.review_title}</h5>
      <p className="text-white/90 leading-relaxed">{review?.review_text}</p>
    </div>
  );
};

const BookDetail = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useSelector((state) => state.user);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Review Form States (modal yerine inline)
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: '',
    content: ''
  });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError("No book ID provided in URL parameters");
      setLoading(false);
      return;
    }

    // Tüm ID türleri için core backend'i kullan
    fetchFromCoreBackend(id);
    fetchReviews(id);
  }, [id]);

  const fetchFromCoreBackend = useCallback((id) => {
    setLoading(true);

    axios
      .post("/api/books/get/id", parseInt(id), {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        const data = res.data;

        if (typeof data === "string" && data.startsWith("<!DOCTYPE html")) {
          throw new Error("Expected JSON response, but received HTML");
        }

        // Backend spesifik hata kontrolü
        if (data.status?.code === "3") {
          setError(data.values?.[0] || "Book not found.");
          return;
        }

        let bookData = null;

        if (data.status?.code === "0" && Array.isArray(data.books) && data.books.length > 0) {
          bookData = data.books[0];
        } else if (!("status" in data)) {
          bookData = data;
        }

        if (bookData) {
          setBook(bookData);
        } else {
          setError("Book not found or backend is returning invalid format.");
        }
      })
      .catch((err) => {
        setError("Book not found or backend is returning invalid format.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const fetchReviews = async (bookId) => {
    try {
      const response = await api.post("/reviews/get/book-reviews", parseInt(bookId));
      
      if (response?.data?.status?.code === "0") {
        setReviews(response.data.reviews || []);
      }
    } catch (error) {
      console.error("Yorumlar yüklenirken hata oluştu:", error);
    } finally {
      setReviewsLoading(false);
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

  // Review submission handler
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    setReviewError(null);

    try {
      const reviewPayload = JSON.stringify({
        book_id: book.id,
        user_id: currentUser?.id,
        rating: reviewData.rating,
        review_title: reviewData.title,
        review_text: reviewData.content
      });

      const response = await api.post("/reviews/create/book-review", reviewPayload);
      if (response?.data?.code === "0") {
        toast.success("Yorumunuz başarıyla eklendi!");
        // Yorumları yeniden yükle
        fetchReviews(book.id);
        // Form'u kapat ve temizle
        setShowReviewForm(false);
        setReviewData({
          rating: 5,
          title: '',
          content: ''
        });
      } else {
        throw new Error(response?.data?.status?.message || "Yorum eklenirken bir hata oluştu");
      }
    } catch (err) {
      console.error(err);
      setReviewError(err.response?.data?.message || "Yorum eklenirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setReviewLoading(false);
    }
  };

  // Review form'unu aç/kapat
  const toggleReviewForm = () => {
    setShowReviewForm(!showReviewForm);
    setReviewError(null);
    if (!showReviewForm) {
      // Form açılırken temizle
      setReviewData({
        rating: 5,
        title: '',
        content: ''
      });
    }
  };

  // Like handler
  const handleLike = async () => {
    if (!currentUser) {
      toast.info("Lütfen beğenmek için giriş yapın.");
      return;
    }
    if (!book) return;

    try {
      const response = await fetch('/api/shelves/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: currentUser.id || currentUser._id,
          book_id: book.id || book._id
        })
      });
      const data = await response.json();
      if (data.code === "0") {
        toast.success("Kitap beğenilere eklendi!");
        // İsteğe bağlı: Beğeni state'i güncellenebilir
      } else {
        toast.error("Hata: " + (data.values ? data.values.join(', ') : 'Bilinmeyen hata'));
      }
    } catch (err) {
      toast.error("Beğenme işlemi başarısız. Lütfen tekrar deneyin.");
    }
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
              <button
                className="bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded-full transition cursor-pointer"
                onClick={handleLike}
              >
                ❤️ Like
              </button>
              <button className="bg-blue-500/20 hover:bg-blue-500/30 px-4 py-2 rounded-full transition cursor-pointer">
                ➕ Add to Reading List
              </button>
              <button
                onClick={toggleReviewForm}
                className="bg-green-500/20 hover:bg-green-500/30 px-4 py-2 rounded-full transition cursor-pointer"
              >
                ✍️ Write Review
              </button>
            </div>

            {/* Inline Review Form */}
            {showReviewForm && (
              <div className="mt-8 p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
                {/* Form Header */}
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">Write Review</h3>
                  <button
                    onClick={toggleReviewForm}
                    className="text-white/60 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition"
                  >
                    ✕
                  </button>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-white font-medium mb-3">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setReviewData(prev => ({ ...prev, rating: star }));
                        }}
                        className={`text-3xl transition-colors ${star <= reviewData.rating
                            ? 'text-yellow-400 hover:text-yellow-300'
                            : 'text-white/30 hover:text-white/50'
                          }`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="ml-3 text-white/80">({reviewData.rating}/5)</span>
                  </div>
                </div>

                {/* Review Title */}
                <div>
                  <label className="block text-white font-medium mb-2">Review Title</label>
                  <input
                    type="text"
                    value={reviewData.title}
                    onChange={(e) => setReviewData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Give your review a title..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition"
                    required
                  />
                </div>

                {/* Review Content */}
                <div>
                  <label className="block text-white font-medium mb-2">Your Review</label>
                  <textarea
                    value={reviewData.content}
                    onChange={(e) => setReviewData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Share your thoughts about this book..."
                    rows="4"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition resize-none"
                    required
                  />
                </div>

                {/* Error Message */}
                {reviewError && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
                    {reviewError}
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={toggleReviewForm}
                    className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewLoading}
                    onClick={handleReviewSubmit}
                    className="flex-1 px-6 py-3 bg-green-600/80 hover:bg-green-600 disabled:bg-green-600/40 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {reviewLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        ✍️ Submit Review
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold mb-6">Reviews</h3>
              
              {reviewsLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-white/70">Yorumlar yükleniyor...</p>
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-white/5 rounded-xl">
                  <p className="text-white/70">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
