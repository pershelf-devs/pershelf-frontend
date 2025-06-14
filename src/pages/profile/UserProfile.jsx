import React, { useEffect, useState } from "react";
import { api } from "../../api/api";
import { useSearchParams } from "react-router-dom";
import BooksCard from '../../components/elements/BooksCard';

const UserProfile = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('id');
  
  const [activeTab, setActiveTab] = useState("Books");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userReviews, setUserReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [likedBooks, setLikedBooks] = useState([]);
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [readList, setReadList] = useState([]);
  const [userBooks, setUserBooks] = useState([]);

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
    }
  }, [user]);

  useEffect(() => {
    if (user && activeTab) {
      switch (activeTab) {
        case "Books":
          if (userBooks.length === 0) fetchUserBooks();
          break;
        case "Reviews":
          if (userReviews.length === 0) fetchUserReviews();
          break;
        case "Liked":
          if (likedBooks.length === 0) fetchLikedBooks();
          break;
        case "Favorites":
          if (favoriteBooks.length === 0) fetchFavoriteBooks();
          break;
        case "Readlist":
          if (readList.length === 0) fetchReadList();
          break;
      }
    }
  }, [user, activeTab]);

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
      const response = await api.post(`/reviews/get/by-user`, userId);
      if (response?.data?.status?.code === "0") {
        const reviewsData = response.data.reviews || [];
        
        // Benzersiz book_id'leri topla
        const bookIds = [...new Set(reviewsData.map(review => review.book_id))];
        
        // Kitap bilgilerini çek
        if (bookIds.length > 0) {
          try {
            const bookPromises = bookIds.map(bookId => 
              api.post("/api/books/get/id", parseInt(bookId))
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

  const getProfileImage = () => {
    if (user?.image_base64 && user.image_base64.startsWith('data:image/')) {
      return user.image_base64;
    }
    // Fallback to a default avatar or create one with initials
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=6366f1&color=fff&size=128`;
  };

  const getBookImage = (book) => {
    if (book?.image_base64 && book.image_base64.startsWith('data:image/')) {
      return book.image_base64;
    }
    if (book?.image_url && book.image_url !== "" && !book.image_url.includes("placeholder")) {
      return book.image_url;
    }
    if (book?.image && book.image !== "" && !book.image.includes("placeholder")) {
      return book.image;
    }
    if (book?.cover_image && book.cover_image !== "" && !book.cover_image.includes("placeholder")) {
      return book.cover_image;
    }
    return "/images/book-placeholder.png";
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Books":
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">📚 Okunan Kitaplar ({userBooks.length})</h3>
            {userBooks.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {userBooks.map((book, index) => (
                  <BooksCard key={book.id || book._id || index} book={book} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-white/70">
                <div className="text-4xl mb-4">📖</div>
                <p>Henüz hiç kitap okunmamış.</p>
              </div>
            )}
          </div>
        );

      case "Reviews":
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">📝 Yorumlar ({userReviews.length})</h3>
            {reviewsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                <p className="text-white/70 mt-2">Yorumlar yükleniyor...</p>
              </div>
            ) : userReviews.length > 0 ? (
              <div className="space-y-4">
                {userReviews.map((review, index) => (
                  <div key={review.id || index} className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                    <div className="flex gap-4">
                      {/* Kitap Kapağı */}
                      <div className="flex-shrink-0">
                        <div className="w-16 h-24 rounded overflow-hidden">
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
                        </div>
                      </div>

                      {/* Yorum İçeriği */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-white text-lg">{review.book_title}</h4>
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
                        
                        <h5 className="font-medium text-white mb-2">{review.title}</h5>
                        <p className="text-white/80 text-sm leading-relaxed">{review.content}</p>
                        
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
            ) : (
              <div className="text-center py-12 text-white/70">
                <div className="text-4xl mb-4">💭</div>
                <p>Henüz hiç yorum yapılmamış.</p>
              </div>
            )}
          </div>
        );

      case "Liked":
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">❤️ Beğenilen Kitaplar ({likedBooks.length})</h3>
            {likedBooks.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {likedBooks.map((book, index) => (
                  <BooksCard key={book.id || book._id || index} book={book} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-white/70">
                <div className="text-4xl mb-4">💔</div>
                <p>Henüz hiç kitap beğenilmemiş.</p>
              </div>
            )}
          </div>
        );

      case "Favorites":
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">⭐ Favori Kitaplar ({favoriteBooks.length})</h3>
            {favoriteBooks.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {favoriteBooks.map((book, index) => (
                  <div key={book.id || book._id || index} className="transform scale-50 origin-top-left">
                    <BooksCard book={book} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-white/70">
                <div className="text-4xl mb-4">⭐</div>
                <p>Henüz hiç favori kitap eklenmemiş.</p>
              </div>
            )}
          </div>
        );

      case "Readlist":
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">📖 Okuma Listesi ({readList.length})</h3>
            {readList.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {readList.map((book, index) => (
                  <BooksCard key={book.id || book._id || index} book={book} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-white/70">
                <div className="text-4xl mb-4">📚</div>
                <p>Okuma listesi boş.</p>
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold mb-2">Kullanıcı Bulunamadı</h2>
          <p className="text-white/70">Bu kullanıcı mevcut değil veya profili gizli.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="max-w-6xl mx-auto px-6 py-8">
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
              <h1 className="text-3xl font-bold text-white mb-2">{user.username}</h1>
              <p className="text-white/70 mb-4">{user.email}</p>
              
              {/* İstatistikler */}
              <div className="flex flex-wrap justify-center md:justify-start gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{userBooks.length}</div>
                  <div className="text-sm text-white/70">Okunan</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{userReviews.length}</div>
                  <div className="text-sm text-white/70">Yorum</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{likedBooks.length}</div>
                  <div className="text-sm text-white/70">Beğeni</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{favoriteBooks.length}</div>
                  <div className="text-sm text-white/70">Favori</div>
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
                {tab === "Books" && "📚 Kitaplar"}
                {tab === "Reviews" && "📝 Yorumlar"}
                {tab === "Liked" && "❤️ Beğenilenler"}
                {tab === "Favorites" && "⭐ Favoriler"}
                {tab === "Readlist" && "📖 Okuma Listesi"}
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