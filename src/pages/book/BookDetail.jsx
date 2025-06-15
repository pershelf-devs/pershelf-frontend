import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "../../api/api";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import NotificationService from '../../utils/notificationService';

const BookDetail = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useSelector((state) => state.user);
  const [allReviews, setAllReviews] = useState([]); // Tüm review'ları sakla
  const [reviewsLoading, setReviewsLoading] = useState(true);
  
  // Simple pagination state (reviews için)
  const [currentReviewPage, setCurrentReviewPage] = useState(1);
  
  const reviewsPerPage = 5; // Her sayfada 5 yorum göster
  
  // Pagination helper functions
  const getSimplePaginatedData = (data, itemsPerPage) => {
    const startIndex = (currentReviewPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const renderSimplePagination = (totalItems, itemsPerPage) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          onClick={() => setCurrentReviewPage(prev => Math.max(prev - 1, 1))}
          disabled={currentReviewPage === 1}
          className="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/30 rounded-lg transition"
        >
          ←
        </button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => setCurrentReviewPage(page)}
            className={`px-3 py-2 rounded-lg transition ${
              currentReviewPage === page
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white/80'
            }`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => setCurrentReviewPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentReviewPage === totalPages}
          className="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:text-white/30 rounded-lg transition"
        >
          →
        </button>
      </div>
    );
  };
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
          <Link 
            to={`/user/profile?id=${review?.user_id}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
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
              <h4 className="font-semibold hover:text-blue-300 transition-colors">{review?.username}</h4>
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
          </Link>
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
          alt={book.title || t("unknown_title")}
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
              {book.title || t("unknown_title")}
            </h3>
          </div>

          <div className="relative z-10 mt-auto">
            <div className="h-px bg-white/30 mb-3"></div>
            <p className="text-sm opacity-90 font-medium text-center">
              {book.author || t("unknown_author")}
            </p>
          </div>
        </div>
      </div>
    );
  }, [getBookImage]);

  const fetchFromCoreBackend = useCallback((id) => {
    setLoading(true);
    setError(null);

    // Loading notification
    const loadingToast = NotificationService.loading("Kitap bilgileri yükleniyor...");

    api
      .post("/books/get/id", parseInt(id), {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        // Dismiss loading toast
        NotificationService.dismiss(loadingToast);

        const data = res.data;

        if (typeof data === "string" && data.startsWith("<!DOCTYPE html")) {
          throw new Error("Expected JSON response, but received HTML");
        }

        if (data.status?.code === "3") {
          const errorMsg = data.values?.[0] || "Kitap bulunamadı.";
          setError(errorMsg);
          NotificationService.error(errorMsg);
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
          // NotificationService.success(`"${bookData.title}" kitabı yüklendi 📖`, { autoClose: 2000 });
        } else {
          const errorMsg = "Kitap bulunamadı veya sunucu geçersiz format döndürüyor.";
          setError(errorMsg);
          NotificationService.error(errorMsg);
        }
      })
      .catch((err) => {
        // Dismiss loading toast
        NotificationService.dismiss(loadingToast);
        
        console.error("Book fetch error:", err);
        
        let errorMessage = "Kitap yüklenirken hata oluştu.";
        
        if (err.code === 'NETWORK_ERROR' || !err.response) {
          errorMessage = "İnternet bağlantınızı kontrol edin.";
          NotificationService.networkError();
        } else if (err.response?.status === 404) {
          errorMessage = "Kitap bulunamadı.";
          NotificationService.error(errorMessage);
        } else if (err.response?.status === 500) {
          NotificationService.serverError();
        } else {
          NotificationService.error(errorMessage);
        }
        
        setError(errorMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const fetchReviews = async (bookId) => {
    try {
      setReviewsLoading(true);
      const response = await api.post("/reviews/get/book-reviews", parseInt(bookId));

      if (response?.data?.status?.code === "0") {
        let reviewsData = response.data.reviews || [];
        
        // Tarihe göre sırala (en yeni en üstte)
        reviewsData = reviewsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
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
            
            setAllReviews(reviewsWithUsers);
            
            // Success notification (sadece review varsa)
            // if (reviewsWithUsers.length > 0) {
            //   NotificationService.info(`${reviewsWithUsers.length} inceleme yüklendi 💬`, { autoClose: 2000 });
            // }
            
          } catch (userFetchError) {
            console.error("❌ Kullanıcı bilgileri alınırken hata:", userFetchError);
            setAllReviews(reviewsData);
            NotificationService.warning("İncelemeler yüklendi ancak kullanıcı bilgileri eksik.");
          }
        } else {
          setAllReviews(reviewsData);
        }
      } else {
        // API'den error response geldi
        NotificationService.warning("İncelemeler yüklenirken bir sorun oluştu.");
      }
    } catch (error) {
      console.error("Yorumlar yüklenirken hata oluştu:", error);
      
      // Network error handling
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        NotificationService.networkError();
      } else if (error.response?.status === 500) {
        NotificationService.serverError();
      } else {
        NotificationService.error("İncelemeler yüklenirken hata oluştu.");
      }
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    setReviewError(null);

    // Loading notification
    const loadingToast = NotificationService.loading("İncelemeniz gönderiliyor...");

    try {
      const reviewPayload = JSON.stringify({
        book_id: book.id,
        user_id: currentUser?.id,
        rating: reviewData.rating,
        review_title: reviewData.title,
        review_text: reviewData.content
      });

      const response = await api.post("/reviews/create/book-review", reviewPayload);
      
      // Dismiss loading toast
      NotificationService.dismiss(loadingToast);
      
      if (response?.data?.code === "0") {
        NotificationService.book.reviewSuccess();
        // Yeni yorum eklendikten sonra ilk sayfaya dön ve yeniden yükle
        setCurrentReviewPage(1);
        fetchReviews(book.id);
        setShowReviewForm(false);
        setReviewData({
          rating: 5,
          title: '',
          content: ''
        });
      } else {
        const errorMsg = response?.data?.status?.message || "İnceleme eklenirken bir hata oluştu";
        setReviewError(errorMsg);
        NotificationService.book.reviewError();
      }
    } catch (err) {
      // Dismiss loading toast
      NotificationService.dismiss(loadingToast);
      
      console.error("Review submission error:", err);
      
      let errorMessage = "İnceleme eklenirken bir hata oluştu. Lütfen tekrar deneyin.";
      
      if (err.code === 'NETWORK_ERROR' || !err.response) {
        NotificationService.networkError();
      } else if (err.response?.status === 500) {
        NotificationService.serverError();
      } else if (err.response?.status === 400) {
        errorMessage = "İnceleme verileriniz geçersiz. Lütfen kontrol edin.";
        NotificationService.validationError(errorMessage);
      } else {
        NotificationService.book.reviewError();
      }
      
      setReviewError(errorMessage);
    } finally {
      setReviewLoading(false);
    }
  };

  const toggleReviewForm = () => {
    // Kitap okunmadan yorum yazılamaz
    if (!bookStatus?.read && !showReviewForm) {
      NotificationService.warning(t("need_to_read_first"));
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
      NotificationService.info(t("login_required"));
      return;
    }
    if (!book) return;

    // Kitap okunmadan beğenilemez
    if (!bookStatus?.read) {
      NotificationService.warning(t("need_to_read_to_like"));
      return;
    }

    try {
      const response = await api.post('/user-book-relations/like', {
        user_id: currentUser.id || currentUser._id,
        book_id: book.id || book._id
      });

      if (response?.data?.status?.code === "0") {
        setBookStatus(response?.data?.userBookRelations?.[0]);
        NotificationService.success("Kitabı beğendiniz! ❤️");
        
        // ProfilePage'deki liked books listesini güncelle
        if (window.refreshProfileLikedBooks) {
          window.refreshProfileLikedBooks();
        }
      } 
    } catch (err) {
      NotificationService.error("Beğenme işlemi başarısız. Lütfen tekrar deneyin.");
    }
  };

  const handleFavorite = async () => {
    if (!currentUser) {
      NotificationService.info("Lütfen favori eklemek için giriş yapın.");
      return;
    }
    if (!book) return;

    // Kitap okunmadan favoriye eklenemez
    if (!bookStatus?.read) {
      NotificationService.warning(t("need_to_read_to_favorite"));
      return;
    }

    try {
      const response = await api.post('/user-book-relations/favorite', {
        user_id: currentUser.id || currentUser._id,
        book_id: book.id || book._id
      });

      if (response?.data?.status?.code === "0") {
        setBookStatus(response?.data?.userBookRelations?.[0]);
        NotificationService.success("Kitap favorilere eklendi! ⭐");
      } 
    } catch (err) {
      NotificationService.error("Favori işlemi başarısız. Lütfen tekrar deneyin.");
    }
  };

  const handleread_list = async () => {
    if (!currentUser) {
      NotificationService.info("Lütfen okuma listesine eklemek için giriş yapın.");
      return;
    }
    if (!book) return;

    try {
      const response = await api.post('/user-book-relations/add-to-read-list', {
        user_id: currentUser.id || currentUser._id,
        book_id: book.id || book._id
      });

      console.log("Reading List API Response:", response?.data);

      if (response?.data?.status?.code === "0") {
        console.log("Reading List API Response:", response?.data);
        setBookStatus(response?.data?.userBookRelations?.[0]);
      } 
    } catch (err) {
      console.error("Reading List Error:", err);
      NotificationService.error("Okuma listesi işlemi başarısız. Lütfen tekrar deneyin.");
    }
  };

  const handleRead = async () => {
    if (!currentUser) {
      NotificationService.info("Lütfen okudum işaretlemek için giriş yapın.");
      return;
    }
    if (!book) return;

    try {
      const response = await api.post('/user-book-relations/set-as-read', {
        user_id: currentUser.id || currentUser._id,
        book_id: book.id || book._id
      });

      console.log("Mark as Read API Response:", response?.data);

      if (response?.data?.status?.code === "0") {
        // Kitap okundu olarak işaretlendi
        setBookStatus(response?.data?.userBookRelations?.[0]);
        NotificationService.success("Kitap okudum olarak işaretlendi ve okuma listesinden kaldırıldı! 👁️✅");
        
        // ProfilePage'deki readList'i güncelle
        if (window.refreshProfileReadList) {
          window.refreshProfileReadList();
        }
      } 
    } catch (err) {
      NotificationService.error("Okudum işaretleme başarısız. Lütfen tekrar deneyin.");
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
          <p className="text-lg">{t("loading_book_details")}</p>
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
            {error?.includes("will be available soon") ? t("coming_soon") : t("book_not_found")}
          </h2>
          <p className="text-white/70 mb-4 leading-relaxed">
            {error || t("book_not_exist")}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.history.back()}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
            >
              ← {t("go_back")}
            </button>
            {error?.includes("will be available soon") && (
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-500/20 hover:bg-blue-500/30 px-4 py-2 rounded-lg transition"
              >
                🔄 {t("try_again")}
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
              {bookStatus?.read ? t("marked_as_read") : t("mark_as_read")}
            </button>
          </div>
          
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold">{book.title || t("unknown_title")}</h1>
            <p className="text-white/70 text-sm">
              by {book.author || t("unknown_author")}
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
                <span className="text-white/80 text-sm">{book.reads.toLocaleString()} {t("reads")}</span>
              </div>
            )}


            {book.isbn && (
              <p className="text-white/60 text-sm">ISBN: {book.isbn}</p>
            )}

            {book.publisher && (
              <p className="text-white/60 text-sm">Publisher: {book.publisher}</p>
            )}

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{t("description")}</h3>
              <p className="text-white/90 leading-relaxed">
                {book.description || book.summary || t("no_description")}
              </p>
            </div>

            {book.genre && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{t("genre")}</h3>
                <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm">
                  {book.genre}
                </span>
              </div>
            )}

            {(book.created_at || book.updated_at) && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{t("publication_info")}</h3>
                <div className="space-y-1 text-sm text-white/70">
                  {book.created_at && (
                    <p>{t("added")}: {new Date(book.created_at).toLocaleDateString()}</p>
                  )}
                  {book.updated_at && book.updated_at !== book.created_at && (
                    <p>{t("updated")}: {new Date(book.updated_at).toLocaleDateString()}</p>
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
                {bookStatus?.like ? t("liked") : t("like")}
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
                  {bookStatus?.favorite ? t("in_favorites") : t("add_to_favorites")}
                </span>
              </button>
              {/* Add to Reading List */}
              <button 
                onClick={handleread_list}
                className={`px-4 py-2 rounded-full transition-all duration-300 cursor-pointer flex items-center gap-2 hover:scale-105 ${
                  (bookStatus?.read_list || bookStatus?.readingList)
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-blue-500/20 hover:bg-blue-500/30 text-white/80'
                }`}
              >
                <span className={`text-xl transition-transform duration-300 ${(bookStatus?.read_list || bookStatus?.readingList) ? 'scale-110' : ''}`}>
                  {(bookStatus?.read_list || bookStatus?.readingList) ? '📖' : '➕'}
                </span>
                {(bookStatus?.read_list || bookStatus?.readingList) ? t("in_reading_list") : t("add_to_reading_list")}
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
                ✍️ {t("write_review")}
              </button>
            </div>

            {showReviewForm && (
              <div className="mt-8 p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">{t("write_review_title")}</h3>
                  <button
                    onClick={toggleReviewForm}
                    className="text-white/60 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition"
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">{t("rating")}</label>
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
                  <label className="block text-white font-medium mb-2">{t("review_title")}</label>
                  <input
                    type="text"
                    value={reviewData.title}
                    onChange={(e) => setReviewData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={t("review_title_placeholder")}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">{t("your_review")}</label>
                  <textarea
                    value={reviewData.content}
                    onChange={(e) => setReviewData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder={t("review_placeholder")}
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
                    {t("cancel")}
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
                        {t("submitting")}
                      </>
                    ) : (
                      <>
                        ✍️ {t("submit_review")}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-12">
              <h3 className="text-2xl font-bold mb-6">{t("reviews")}</h3>

              {reviewsLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-white/70">{t("loading_reviews")}</p>
                </div>
              ) : allReviews.length > 0 ? (
                <div className="space-y-6">
                  <div className="space-y-6">
                    {getSimplePaginatedData(allReviews, reviewsPerPage).map((review, index) => (
                      <div key={`${review.id || review._id}-${index}`}>
                        {renderReviewCard(review)}
                      </div>
                    ))}
                  </div>
                  {renderSimplePagination(allReviews.length, reviewsPerPage)}
                </div>
              ) : (
                <div className="text-center py-8 bg-white/5 rounded-xl">
                  <p className="text-white/70">{t("no_reviews_yet")}</p>
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
