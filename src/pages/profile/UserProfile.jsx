import React, { useEffect, useState } from "react";
import { api } from "../../api/api";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import BooksCard from '../../components/elements/BooksCard';
import usePagination from '../../hooks/usePagination.jsx';
import NotificationService from '../../utils/notificationService';
import { useTranslation } from "react-i18next";

const UserProfile = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('id');
  const { currentUser } = useSelector((state) => state.user);
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState("Books");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userReviews, setUserReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [likedBooks, setLikedBooks] = useState([]);
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [readList, setReadList] = useState([]);
  const [userBooks, setUserBooks] = useState([]);
  
  // Takip sistemi state'leri
  const [followStats, setFollowStats] = useState({
    followers: 0,
    following: 0,
    isFollowing: false
  });
  const [followLoading, setFollowLoading] = useState(false);
  
  // Pagination hook'u
  const { getPaginatedData, renderPagination } = usePagination(5);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  useEffect(() => {
    if (user) {
      // İstatistikler için tüm verileri yükle
      fetchUserBooks();
      fetchUserReviews();
      fetchLikedBooks();
      fetchFavoriteBooks();
      fetchReadList();
      fetchFollowStats();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await api.post("/users/get/id", userId);
      if (response?.data?.status?.code === "0") {
        setUser(response?.data?.users?.[0]);
      }
    } catch (error) {
      console.error("Kullanıcı bilgileri alınırken hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReviews = async () => {
    setReviewsLoading(true);
    try {
      const response = await api.post(`/reviews/get/user-reviews`, userId);
      if (response?.data?.status?.code === "0") {
        const reviewsData = response.data.reviews || [];
        
        // Benzersiz book_id'leri topla
        const bookIds = [...new Set(reviewsData.map(review => review.book_id))];
        
        // Kitap bilgilerini çek
        if (bookIds.length > 0) {
          try {
            const bookPromises = bookIds.map(bookId => 
              api.post("/books/get/id", parseInt(bookId), {
                headers: {
                  "Content-Type": "application/json",
                },
              })
                .then(res => {
                  const bookData = res.data?.books?.[0] || res.data;
                  return {
                    id: bookId,
                    title: bookData?.title || `Book ${bookId}`,
                    author: bookData?.author || 'Unknown Author',
                    image_url: bookData?.image_url || bookData?.cover_image || bookData?.image,
                    image_base64: bookData?.image_base64
                  };
                })
                .catch(err => {
                  console.error(`❌ Book ${bookId} fetch error:`, err);
                  return {
                    id: bookId,
                    title: `Book ${bookId}`,
                    author: 'Unknown Author',
                    image_url: null,
                    image_base64: null
                  };
                })
            );
            
            const booksData = await Promise.all(bookPromises);
            
            // Book bilgilerini map haline getir
            const booksMap = booksData.reduce((acc, book) => {
              acc[book.id] = book;
              return acc;
            }, {});
            
            // Review'lara book bilgilerini ekle
            const reviewsWithBooks = reviewsData.map(review => ({
              ...review,
              book_title: booksMap[review.book_id]?.title || `Book ${review.book_id}`,
              book_author: booksMap[review.book_id]?.author || 'Unknown Author',
              book_image: booksMap[review.book_id]?.image_base64 || booksMap[review.book_id]?.image_url
            }));
            
            setUserReviews(reviewsWithBooks);
            
          } catch (bookFetchError) {
            console.error("❌ Kitap bilgileri alınırken hata:", bookFetchError);
            setUserReviews(reviewsData);
          }
        } else {
          setUserReviews(reviewsData);
        }
      }
    } catch (err) {
      setUserReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchLikedBooks = async () => {
    try {
      const res = await api.post('/books/get/user/liked-books', userId);
      if (res?.data?.status?.code === "0") {
        setLikedBooks(res?.data?.books || []);
      }
    } catch (error) {
      console.error("Beğenilen kitaplar alınırken hata:", error);
      setLikedBooks([]);
    }
  };

  const fetchFavoriteBooks = async () => {
    try {
      const favoriteBooksResp = await api.post('/books/get/user/favorite-books', userId);
      if (favoriteBooksResp?.data?.status?.code === "0") {
        setFavoriteBooks(favoriteBooksResp?.data?.books || []);
      }
    } catch (error) {
      console.error("Favori kitaplar alınırken hata:", error);
      setFavoriteBooks([]);
    }
  };

  const fetchReadList = async () => {
    try {
      const readListResp = await api.post('/books/get/user/read-list', userId);
      if (readListResp?.data?.status?.code === "0") {
        setReadList(readListResp?.data?.books || []);
      }
    } catch (error) {
      console.error("Okuma listesi alınırken hata:", error);
      setReadList([]);
    }
  };

  const fetchUserBooks = async () => {
    try {
      const userBooksResp = await api.post('/books/get/user/read-books', userId);
      if (userBooksResp?.data?.status?.code === "0") {
        setUserBooks(userBooksResp?.data?.books || []);
      } else {
        setUserBooks([]);
      }
    } catch (error) {
      console.error("Okunan kitaplar alınırken hata:", error);
      setUserBooks([]);
    }
  };

  // Takip istatistiklerini yükle
  const fetchFollowStats = async () => {
    try {
      const response = await api.post("/users/get/follow-stats", parseInt(userId));
      if (response?.data?.status?.code === "0") {
        setFollowStats({
          followers: response.data.followers || 0,
          following: response.data.following || 0,
          isFollowing: response.data.isFollowing || false
        });
      } else {
        // API'den başarısız response geldi
        setFollowStats({
          followers: 0,
          following: 0,
          isFollowing: false
        });
      }
    } catch (error) {
      console.error("Takip istatistikleri alınırken hata:", error);
      setFollowStats({
        followers: 0,
        following: 0,
        isFollowing: false
      });
    }
  };

  // Takip et/takibi bırak işlevi
  const handleFollowToggle = async () => {
    if (!currentUser) {
      toast.info(t("login_to_follow"));
      return;
    }

    if (currentUser.id === parseInt(userId)) {
      toast.warning(t("cannot_follow_yourself"));
      return;
    }

    setFollowLoading(true);
    try {
      // Gerçek API endpoint'i kullan - farklı formatları dene
      console.log("Sending follow request for userId:", parseInt(userId));
      console.log("Current user:", currentUser?.id);
      
      // Önce sadece integer olarak dene
      let response;
      try {
        response = await api.post("/follows/follow-user", parseInt(userId));
      } catch (firstError) {
        console.log("Integer format failed, trying object format...");
        // Eğer integer format çalışmazsa object format dene
        try {
          response = await api.post("/follows/follow-user", {
            user_id: parseInt(userId)
          });
        } catch (secondError) {
          console.log("Object format failed, trying different field names...");
          // Farklı field isimleri dene
          try {
            response = await api.post("/follows/follow-user", {
              following_id: parseInt(userId),
              follower_id: currentUser?.id
            });
          } catch (thirdError) {
            console.log("All formats failed. API might not be ready yet.");
            // Eğer API henüz hazır değilse, geçici mock response
            throw new Error("Follow API endpoint is not ready yet. Please check with backend team.");
          }
        }
      }

      if (response?.data?.status?.code === "0") {
        setFollowStats(prev => ({
          ...prev,
          isFollowing: !prev.isFollowing,
          followers: prev.isFollowing ? prev.followers - 1 : prev.followers + 1
        }));
        
        toast.success(followStats.isFollowing ? t("unfollow_success") : t("follow_success"));
        
        // NotificationService kullanarak daha güzel bildirim
        if (!followStats.isFollowing) {
          NotificationService.social.followSuccess(user?.username || 'User');
        }
      } else {
        throw new Error(response?.data?.message || t("follow_error"));
      }
      
    } catch (error) {
      console.error("Takip işlemi sırasında hata:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      let errorMessage = t("follow_error");
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      toast.error(errorMessage);
    } finally {
      setFollowLoading(false);
    }
  };

  const getProfileImage = () => {
    if (user?.image_base64 && user.image_base64.startsWith('data:image/')) {
      return user.image_base64;
    }
    // Fallback to a default avatar or create one with initials
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=6366f1&color=fff&size=128`;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Books":
        const paginatedBooks = getPaginatedData(userBooks, "Books");
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">📚 {t("read_books")} ({userBooks.length})</h3>
            {userBooks.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {paginatedBooks.map((book, index) => (
                    <BooksCard key={book.id || book._id || index} book={book} />
                  ))}
                </div>
                {renderPagination(userBooks, "Books")}
              </>
            ) : (
              <div className="text-center py-12 text-white/70">
                <div className="text-4xl mb-4">📖</div>
                <p>{t("no_books_read")}</p>
              </div>
            )}
          </div>
        );

      case "Reviews":
        const paginatedReviews = getPaginatedData(userReviews, "Reviews");
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">📝 {t("reviews")} ({userReviews.length})</h3>
            {reviewsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                <p className="text-white/70 mt-2">{t("loading_reviews")}</p>
              </div>
            ) : userReviews.length > 0 ? (
              <>
                <div className="space-y-4">
                  {paginatedReviews.map((review, index) => (
                    <div key={review.id || index} className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                      <div className="flex gap-4">
                        {/* Kitap Kapağı */}
                        <div className="flex-shrink-0">
                          <a 
                            href={`/book/details?id=${review.book_id}`}
                            className="block w-16 h-24 rounded overflow-hidden hover:opacity-80 transition-opacity cursor-pointer"
                          >
                            {review.book_image ? (
                              <img
                                src={review.book_image}
                                alt={review.book_title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 flex items-center justify-center text-white text-xs font-bold text-center p-1">
                                {review.book_title?.substring(0, 10) || "?"}
                              </div>
                            )}
                          </a>
                        </div>

                        {/* Yorum İçeriği */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <a 
                                href={`/book/details?id=${review.book_id}`}
                                className="hover:text-blue-300 transition-colors"
                              >
                                <h4 className="font-semibold text-white text-lg hover:underline">{review.book_title}</h4>
                              </a>
                              <p className="text-white/70 text-sm">{review.book_author}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-lg ${
                                    i < review.rating ? 'text-yellow-400' : 'text-gray-600'
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <h5 className="font-medium text-white mb-2">{review.review_title || review.title || t("untitled_review")}</h5>
                          <p className="text-white/80 text-sm leading-relaxed">{review.review_text || review.content || t("no_content")}</p>
                          
                          <div className="mt-3 text-xs text-white/60">
                            {new Date(review.created_at).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {renderPagination(userReviews, "Reviews")}
              </>
            ) : (
              <div className="text-center py-12 text-white/70">
                <div className="text-4xl mb-4">💭</div>
                <p>{t("no_reviews_written")}</p>
              </div>
            )}
          </div>
        );

      case "Liked":
        const paginatedLiked = getPaginatedData(likedBooks, "Liked");
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">❤️ {t("liked_books")} ({likedBooks.length})</h3>
            {likedBooks.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {paginatedLiked.map((book, index) => (
                    <BooksCard key={book.id || book._id || index} book={book} />
                  ))}
                </div>
                {renderPagination(likedBooks, "Liked")}
              </>
            ) : (
              <div className="text-center py-12 text-white/70">
                <div className="text-4xl mb-4">💔</div>
                <p>{t("no_books_liked")}</p>
              </div>
            )}
          </div>
        );

      case "Favorites":
        const paginatedFavorites = getPaginatedData(favoriteBooks, "Favorites");
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">⭐ {t("favorite_books")} ({favoriteBooks.length})</h3>
            {favoriteBooks.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {paginatedFavorites.map((book, index) => (
                    <BooksCard key={book.id || book._id || index} book={book} />
                  ))}
                </div>
                {renderPagination(favoriteBooks, "Favorites")}
              </>
            ) : (
              <div className="text-center py-12 text-white/70">
                <div className="text-4xl mb-4">⭐</div>
                <p>{t("no_favorite_books")}</p>
              </div>
            )}
          </div>
        );

      case "Readlist":
        const paginatedReadlist = getPaginatedData(readList, "Readlist");
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">📖 {t("reading_list")} ({readList.length})</h3>
            {readList.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {paginatedReadlist.map((book, index) => (
                    <BooksCard key={book.id || book._id || index} book={book} />
                  ))}
                </div>
                {renderPagination(readList, "Readlist")}
              </>
            ) : (
              <div className="text-center py-12 text-white/70">
                <div className="text-4xl mb-4">📚</div>
                <p>{t("no_books_in_reading_list")}</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div 
        className="relative min-h-screen bg-cover bg-center text-white flex items-center justify-center"
        style={{ backgroundImage: "url('/images/explore.png')" }}
      >
        <div className="absolute inset-0 bg-black/70 z-0"></div>
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">{t("loading_profile")}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div 
        className="relative min-h-screen bg-cover bg-center text-white flex items-center justify-center"
        style={{ backgroundImage: "url('/images/explore.png')" }}
      >
        <div className="absolute inset-0 bg-black/70 z-0"></div>
        <div className="relative z-10 text-center text-white">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold mb-2">{t("user_not_found")}</h2>
          <p className="text-white/70">{t("user_not_found_description")}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative min-h-screen bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/images/explore.png')" }}
    >
      <div className="absolute inset-0 bg-black/70 z-0"></div>
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-8">
        {/* Profil Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Profil Fotoğrafı */}
            <div className="relative">
              <img
                src={getProfileImage()}
                alt={user.username}
                className="w-32 h-32 rounded-full object-cover border-4 border-white/20"
              />
            </div>

            {/* Kullanıcı Bilgileri */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{user.username}</h1>
                  <p className="text-white/70 mb-4">{user.email}</p>
                </div>
                
                {/* Takip Butonu - Sadece başka kullanıcılar için göster */}
                {currentUser && currentUser.id !== parseInt(userId) && (
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`group px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 min-w-[140px] justify-center ${
                      followStats.isFollowing
                        ? 'bg-transparent border-2 border-gray-500 text-gray-300 hover:bg-red-600 hover:border-red-600 hover:text-white'
                        : 'bg-white text-gray-900 hover:bg-gray-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {followLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        {t("loading")}
                      </>
                    ) : (
                      <>
                        {followStats.isFollowing ? (
                          <>
                            <span className="group-hover:hidden">{t("following")}</span>
                            <span className="hidden group-hover:inline">{t("unfollow")}</span>
                          </>
                        ) : (
                          t("follow")
                        )}
                      </>
                    )}
                  </button>
                )}
              </div>
              
              {/* İstatistikler */}
              <div className="flex flex-wrap justify-center md:justify-start gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{userBooks.length}</div>
                  <div className="text-sm text-white/70">{t("read")}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{userReviews.length}</div>
                  <div className="text-sm text-white/70">{t("review")}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{likedBooks.length}</div>
                  <div className="text-sm text-white/70">{t("like")}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{favoriteBooks.length}</div>
                  <div className="text-sm text-white/70">{t("favorite")}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{followStats.followers}</div>
                  <div className="text-sm text-white/70">{t("followers")}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{followStats.following}</div>
                  <div className="text-sm text-white/70">{t("following")}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 mb-8">
          <div className="flex flex-wrap gap-2">
            {["Books", "Reviews", "Liked", "Favorites", "Readlist"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-white text-gray-900 shadow-lg"
                    : "text-white hover:bg-white/20"
                }`}
              >
                {tab === "Books" && `📚 ${t("books")}`}
                {tab === "Reviews" && `📝 ${t("reviews")}`}
                {tab === "Liked" && `❤️ ${t("liked_books")}`}
                {tab === "Favorites" && `⭐ ${t("favorite_books")}`}
                {tab === "Readlist" && `📖 ${t("reading_list")}`}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 