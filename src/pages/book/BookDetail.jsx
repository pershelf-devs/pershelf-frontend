import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { api } from "../../api/api";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const BookDetail = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useSelector((state) => state.user);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [bookStatus, setBookStatus] = useState({
    like: false,
    favorite: false,
    read_list: false,
    read: false
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: '',
    content: ''
  });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);
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

  const renderReviewCard = (review) => (
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

  const renderBookCover = useCallback((book) => {
    const imageUrl = getBookImage(book);
    const hasRealImage = imageUrl !== "/images/book-placeholder.png";

    return (
      <div className="relative w-48 h-72 rounded shadow-lg overflow-hidden">
        <img
          src={imageUrl}
          alt={book.title || "Book"}
          className={`w-full h-full object-contain bg-gradient-to-br from-gray-800 to-gray-900 ${hasRealImage ? 'block' : 'hidden'}`}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />

        <div
          className={`w-full h-full ${hasRealImage ? 'hidden' : 'flex'} bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 flex-col justify-between p-6 text-white relative overflow-hidden`}
          style={{ display: hasRealImage ? 'none' : 'flex' }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-3 left-3 w-8 h-8 border-2 border-white/30 rounded"></div>
            <div className="absolute bottom-3 right-3 w-6 h-6 border border-white/30 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 border border-white/20 rounded-full"></div>
          </div>

          <div className="relative z-10 flex-1 flex items-center justify-center">
            <h3 className="text-lg font-bold leading-tight text-center line-clamp-4">
              {book.title || "Unknown Title"}
            </h3>
          </div>

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
        const reviewsData = response.data.reviews || [];
        
        // Benzersiz user_id'leri topla
        const userIds = [...new Set(reviewsData.map(review => review.user_id))];
        
        // Kullanıcı bilgilerini çek
        if (userIds.length > 0) {
          try {
            const userPromises = userIds.map(userId => 
              api.post("/users/get/id", userId)
                .then(res => {
                  return {
                    id: userId,
                    username: res.data?.users?.[0]?.username || res.data?.user?.username || `User ${userId}`,
                    user_image_base64: res.data?.users?.[0]?.image_base64 || res.data?.user?.image_base64
                  };
                })
                .catch(err => {
                  console.error(`❌ User ${userId} fetch error:`, err);
                  return {
                    id: userId,
                    username: `User ${userId}`,
                    user_image_base64: null
                  };
                })
            );
            
            const usersData = await Promise.all(userPromises);
            
            // User bilgilerini map haline getir
            const usersMap = usersData.reduce((acc, user) => {
              acc[user.id] = user;
              return acc;
            }, {});
            
            // Review'lara username ekle
            const reviewsWithUsers = reviewsData.map(review => ({
              ...review,
              username: usersMap[review.user_id]?.username || `User ${review.user_id}`,
              user_image_base64: usersMap[review.user_id]?.user_image_base64
            }));
            
            setReviews(reviewsWithUsers);
            
          } catch (userFetchError) {
            console.error("❌ Kullanıcı bilgileri alınırken hata:", userFetchError);
            // Hata durumunda review'ları user bilgisi olmadan göster
            setReviews(reviewsData);
          }
        } else {
          setReviews(reviewsData);
        }
      }
    } catch (error) {
      console.error("Yorumlar yüklenirken hata oluştu:", error);
    } finally {
      setReviewsLoading(false);
    }
  };

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
        fetchReviews(book.id);
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

  const toggleReviewForm = () => {
    // Kitap okunmadan yorum yazılamaz
    if (!bookStatus?.read && !showReviewForm) {
      toast.warning("Bu kitap hakkında yorum yazmak için önce okumanız gerekiyor.");
      return;
    }

    setShowReviewForm(!showReviewForm);
    setReviewError(null);
    if (!showReviewForm) {
      setReviewData({
        rating: 5,
        title: '',
        content: ''
      });
    }
  };

  const handleLike = async () => {
    if (!currentUser) {
      toast.info("Please login to like this book.");
      return;
    }
    if (!book) return;

    // Kitap okunmadan beğenilemez
    if (!bookStatus?.read) {
      toast.warning("Bu kitabı beğenmek için önce okumanız gerekiyor.");
      return;
    }

    try {
      const response = await api.post('/user-book-relations/like', {
        user_id: currentUser.id || currentUser._id,
        book_id: book.id || book._id
      });

      if (response?.data?.code === "100") {
        setBookStatus(prev => ({
          ...prev,
          like: true
        }));
        toast.success("Kitabı beğendiniz! ❤️");
      } else if (response?.data?.code === "101") {
        setBookStatus(prev => ({
          ...prev,
          like: false
        }));
        toast.info("Beğeni kaldırıldı.");
      } else {
        toast.error("Error: " + (response?.data?.values ? response.data.values.join(', ') : 'Unknown error'));
      }
    } catch (err) {
      toast.error("Beğenme işlemi başarısız. Lütfen tekrar deneyin.");
    }
  };

  const handleFavorite = async () => {
    if (!currentUser) {
      toast.info("Lütfen favori eklemek için giriş yapın.");
      return;
    }
    if (!book) return;

    // Kitap okunmadan favoriye eklenemez
    if (!bookStatus?.read) {
      toast.warning("Bu kitabı favoriye eklemek için önce okumanız gerekiyor.");
      return;
    }

    try {
      const response = await api.post('/user-book-relations/favorite', {
        user_id: currentUser.id || currentUser._id,
        book_id: book.id || book._id
      });

      if (response?.data?.code === "100") {
        setBookStatus(prev => ({
          ...prev,
          favorite: true
        }));
        toast.success("Kitap favorilere eklendi! ⭐");
      } else if (response?.data?.code === "101") {
        setBookStatus(prev => ({
          ...prev,
          favorite: false
        }));
        toast.info("Kitap favorilerden çıkarıldı.");
      }
    } catch (err) {
      console.error("Favori işlemi başarısız. Lütfen tekrar deneyin.");
      toast.error("Favori işlemi başarısız. Lütfen tekrar deneyin.");
    }
  };

  const handleread_list = async () => {
    if (!currentUser) {
      toast.info("Lütfen okuma listesine eklemek için giriş yapın.");
      return;
    }
    if (!book) return;

    try {
      const response = await api.post('/user-book-relations/add-to-read-list', {
        user_id: currentUser.id || currentUser._id,
        book_id: book.id || book._id
      });

      console.log("Reading List API Response:", response?.data);

      if (response?.data?.code === "100") {
        setBookStatus(prev => ({
          ...prev,
          read_list: true
        }));
        toast.success("Okuma listesine eklendi! 📚");
      } else if (response?.data?.code === "101") {
        setBookStatus(prev => ({
          ...prev,
          read_list: false
        }));
        toast.info("Okuma listesinden çıkarıldı. 📖");
      } else {
        // API başarılı ama farklı response code döndürüyor olabilir
        console.log("Unexpected response code:", response?.data?.code);
        // Başarılı olduğunu varsayarak state'i güncelle
        const newread_listStatus = !bookStatus.read_list;
        setBookStatus(prev => ({
          ...prev,
          read_list: newread_listStatus
        }));
        toast.success(newread_listStatus ? "Okuma listesine eklendi! 📚" : "Okuma listesinden çıkarıldı. 📖");
      }
    } catch (err) {
      console.error("Reading List Error:", err);
      toast.error("Okuma listesi işlemi başarısız. Lütfen tekrar deneyin.");
    }
  };

  const handleRead = async () => {
    if (!currentUser) {
      toast.info("Lütfen okudum işaretlemek için giriş yapın.");
      return;
    }
    if (!book) return;

    try {
      const response = await api.post('/user-book-relations/set-as-read', {
        user_id: currentUser.id || currentUser._id,
        book_id: book.id || book._id
      });

      console.log("Mark as Read API Response:", response?.data);

      if (response?.data?.code === "100") {
        // Kitap okundu olarak işaretlendi
        setBookStatus(prev => ({
          ...prev,
          read: true,
          read_list: false // Okuma listesinden otomatik kaldır
        }));
        toast.success("Kitap okudum olarak işaretlendi ve okuma listesinden kaldırıldı! 👁️✅");
        
        // ProfilePage'deki readList'i güncelle
        if (window.refreshProfileReadList) {
          window.refreshProfileReadList();
        }
      } else if (response?.data?.code === "101") {
        // Okudum işareti kaldırıldı
        setBookStatus(prev => ({
          ...prev,
          read: false
        }));
        toast.info("Okudum işareti kaldırıldı. 👁️");
      } else {
        // API başarılı ama farklı response code döndürüyor olabilir
        console.log("Unexpected response code:", response?.data?.code);
        const newReadStatus = !bookStatus.read;
        setBookStatus(prev => ({
          ...prev,
          read: newReadStatus,
          read_list: newReadStatus ? false : prev.read_list // Okundu ise okuma listesinden kaldır
        }));
        
        if (newReadStatus) {
          toast.success("Kitap okudum olarak işaretlendi ve okuma listesinden kaldırıldı! 👁️✅");
          
          // ProfilePage'deki readList'i güncelle
          if (window.refreshProfileReadList) {
            window.refreshProfileReadList();
          }
        } else {
          toast.success("Okudum işareti kaldırıldı. 👁️");
        }
      }
    } catch (err) {
      console.error("Mark as Read Error:", err);
      toast.error("Okudum işaretleme başarısız. Lütfen tekrar deneyin.");
    }
  };

  useEffect(() => {
    if (!id) {
      setError("No book ID provided in URL parameters");
      setLoading(false);
      return;
    }

    fetchFromCoreBackend(id);
    fetchReviews(id);
  }, [id, fetchFromCoreBackend]);

  useEffect(() => {
    if (!currentUser || !book || !(book.id || book._id)) {
      return; // User veya book yüklenmemişse çıkış yap
    }

    api.post('/user-book-relations/get/user-book-relation', {
      user_id: currentUser?.id || currentUser?._id,
      book_id: book?.id || book?._id
    }).then((res) => {
      if (res?.data?.status?.code === "0") {
        setBookStatus(res?.data?.userBookRelations?.[0]);
      }
    }).catch((error) => {
      console.error("User-book relation alınırken hata:", error);
    });
  }, [currentUser, book]);

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
      <div className="absolute inset-0 bg-black/70 z-0" />
      <div className="relative z-10 py-20 px-6 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-10 items-start">
          <div className="flex flex-col items-center gap-4">
            {renderBookCover(book)}
            
            {/* Mark as Read Button - Below Book Cover */}
            <button 
              onClick={handleRead}
              className={`w-48 px-4 py-3 rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 hover:scale-105 ${
                bookStatus?.read
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                  : 'bg-green-500/20 hover:bg-green-500/30 text-white/80'
              }`}
            >
              <svg 
                className={`w-5 h-5 transition-transform duration-300 ${bookStatus?.read ? 'scale-110' : ''}`}
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
              {bookStatus?.read ? 'Okundu' : 'Okudum'}
            </button>
          </div>
          
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold">{book.title || "Unknown Title"}</h1>
            <p className="text-white/70 text-sm">
              by {book.author || "Unknown Author"}
              {(book.published_year || book.year) && ` • ${book.published_year || book.year}`}
            </p>

            {book.rating && (
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-lg">
                  {"★".repeat(Math.floor(book.rating))}
                  {"☆".repeat(5 - Math.floor(book.rating))}
                </span>
                <span className="text-white/80 text-sm">({book.rating}/5)</span>
              </div>
            )}

            {book.reads !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-blue-400">📖</span>
                <span className="text-white/80 text-sm">{book.reads.toLocaleString()} reads</span>
              </div>
            )}

            {book.isbn && (
              <p className="text-white/60 text-sm">ISBN: {book.isbn}</p>
            )}

            {book.publisher && (
              <p className="text-white/60 text-sm">Publisher: {book.publisher}</p>
            )}

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Description</h3>
              <p className="text-white/90 leading-relaxed">
                {book.description || book.summary || "No description available for this book."}
              </p>
            </div>

            {book.genre && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Genre</h3>
                <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm">
                  {book.genre}
                </span>
              </div>
            )}

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

            <div className="flex gap-4 mt-6">
              <button
                className={`px-4 py-2 rounded-full transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                  !bookStatus?.read 
                    ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed' 
                    : bookStatus?.like
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-105'
                      : 'bg-red-500/20 text-white/80 hover:bg-red-500/30'
                }`}
                onClick={handleLike}
                disabled={!bookStatus?.read}
              >
                <span className={`text-xl transition-transform duration-300 ${bookStatus?.like ? 'scale-110' : ''}`}>
                  {bookStatus?.like ? '❤️' : '🤍'}
                </span>
                {bookStatus?.like ? 'Beğenildi' : 'Beğen'}
              </button>
              {/* Add to Favorite */}
              <button
                onClick={handleFavorite}
                disabled={!bookStatus?.read}
                className={`group px-4 py-2 rounded-full transition-all duration-300 cursor-pointer flex items-center gap-2 hover:scale-105 ${
                  !bookStatus?.read
                    ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                    : bookStatus?.favorite
                      ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 text-yellow-300 shadow-lg shadow-yellow-500/20'
                      : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/20 hover:shadow-lg hover:shadow-purple-500/20'
                }`}
              >
                <span className={`text-xl transition-all duration-300 ${bookStatus?.favorite ? 'animate-bounce' : 'group-hover:rotate-12'}`}>
                  {bookStatus?.favorite ? '⭐' : '☆'}
                </span>
                <span className={`group-hover:text-white/90 ${bookStatus?.favorite ? 'text-yellow-300' : ''}`}>
                  {bookStatus?.favorite ? 'Favorilerde' : 'Favorilere Ekle'}
                </span>
              </button>
              {/* Add to Reading List */}
              <button 
                onClick={handleread_list}
                className={`px-4 py-2 rounded-full transition-all duration-300 cursor-pointer flex items-center gap-2 hover:scale-105 ${
                  bookStatus?.read_list
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-blue-500/20 hover:bg-blue-500/30 text-white/80'
                }`}
              >
                <span className={`text-xl transition-transform duration-300 ${bookStatus?.read_list ? 'scale-110' : ''}`}>
                  {bookStatus?.read_list ? '📖' : '➕'}
                </span>
                {bookStatus?.read_list ? 'Okuma Listesinde' : 'Okuma Listesine Ekle'}
              </button>
              
              <button
                onClick={toggleReviewForm}
                disabled={!bookStatus?.read}
                className={`px-4 py-2 rounded-full transition cursor-pointer ${
                  !bookStatus?.read
                    ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                    : 'bg-green-500/20 hover:bg-green-500/30'
                }`}
              >
                ✍️ Write Review
              </button>
            </div>

            {showReviewForm && (
              <div className="mt-8 p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">Write Review</h3>
                  <button
                    onClick={toggleReviewForm}
                    className="text-white/60 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition"
                  >
                    ✕
                  </button>
                </div>

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

                {reviewError && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
                    {reviewError}
                  </div>
                )}

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

            <div className="mt-12">
              <h3 className="text-2xl font-bold mb-6">Reviews</h3>

              {reviewsLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-white/70">Yorumlar yükleniyor...</p>
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => renderReviewCard(review))}
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
