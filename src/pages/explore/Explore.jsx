import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiCache } from "../../utils/apiCache";
import { api } from "../../api/api";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import usePagination from "../../hooks/usePagination.jsx";

const Explore = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query');
  const [popularBooks, setPopularBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [bookStatuses, setBookStatuses] = useState({});
  const { currentUser } = useSelector((state) => state.user);
  const { t } = useTranslation();

  // Pagination hook'u - search results için 9 kitap per sayfa
  const { getPaginatedData, renderPagination } = usePagination(9);

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

  // Kitapların durumlarını getir
  const fetchBookStatuses = useCallback(async (books) => {
    if (!currentUser || books.length === 0) return;

    try {
      const promises = books.map(book => {
        const bookId = book.id || book._id;
        return api.post('/user-book-relations/get/user-book-relation', {
          user_id: currentUser.id || currentUser._id,
          book_id: bookId
        }).then(res => {
          if (res?.data?.status?.code === "0" && res?.data?.userBookRelations?.[0]) {
            return {
              bookId,
              like: res.data.userBookRelations[0].like,
              favorite: res.data.userBookRelations[0].favorite,
              read: res.data.userBookRelations[0].read,
              readingList: res.data.userBookRelations[0].readingList || res.data.userBookRelations[0].read_list
            };
          }
          return { bookId, like: false, favorite: false, read: false, readingList: false };
        }).catch(() => ({ bookId, like: false, favorite: false, read: false, readingList: false }));
      });

      const results = await Promise.all(promises);
      const statusMap = {};
      results.forEach(({ bookId, like, favorite, read, readingList }) => {
        statusMap[bookId] = { like, favorite, read, readingList };
      });
      
      setBookStatuses(statusMap);
    } catch (err) {
      console.error("Kitap durumları alınamadı:", err);
    }
  }, [currentUser]);

  // Popüler kitaplar yüklendiğinde durumlarını çek
  useEffect(() => {
    if (popularBooks.length > 0) {
      fetchBookStatuses(popularBooks);
    }
  }, [popularBooks, fetchBookStatuses]);

  // Arama sonuçları yüklendiğinde durumlarını çek
  useEffect(() => {
    if (searchResults.length > 0) {
      fetchBookStatuses(searchResults);
    }
  }, [searchResults, fetchBookStatuses]);

  const fetchPopularBooks = async () => {
    const cacheKey = 'most-reads-6';
    
    // Önce cache'den kontrol et
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      setPopularBooks(cachedData);
      return;
    }

    try {
      const res = await api.post("/books/discover/most-reads", { limit: 6 });
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
      // Fetch genres from the API
      const res = await api.post("/books/genres");
      console.log(res);

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
      const response = await api.post("/books/search", {
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

  const handleLike = async (book, event) => {
    event?.preventDefault();
    event?.stopPropagation();
    
    if (!currentUser) {
      toast.info(t("please_login_to_like"));
      return;
    }
    if (!book) return;

    const bookId = book.id || book._id;
    const isRead = bookStatuses[bookId]?.read;
    
    // Hierarchy check: Must read before liking
    if (!isRead) {
      toast.warning(t("must_read_first_like"));
      return;
    }

    try {
      const response = await api.post('/user-book-relations/like', {
        user_id: currentUser.id || currentUser._id,
        book_id: bookId
      });

      if (response?.data?.status?.code === "0") {
        // API'den gelen güncel durumu kullan
        if (response?.data?.userBookRelations?.[0]) {
          setBookStatuses(prev => ({
            ...prev,
            [bookId]: {
              ...prev[bookId],
              like: response.data.userBookRelations[0].like,
              favorite: response.data.userBookRelations[0].favorite,
              read: response.data.userBookRelations[0].read,
              readingList: response.data.userBookRelations[0].readingList || response.data.userBookRelations[0].read_list
            }
          }));
          
          if (response.data.userBookRelations[0].like) {
            toast.success(t("book_liked"));
          } else {
            toast.info(t("like_removed"));
          }

          // Real-time updates for ProfilePage
          if (window.refreshProfileLikedBooks) {
            window.refreshProfileLikedBooks();
          }
        }
      } 
    } catch (err) {
      toast.error(t("like_operation_failed"));
    }
  };

  const handleFavorite = async (book, event) => {
    event?.preventDefault();
    event?.stopPropagation();
    
    if (!currentUser) {
      toast.info(t("please_login_to_favorite"));
      return;
    }
    if (!book) return;

    const bookId = book.id || book._id;
    const isRead = bookStatuses[bookId]?.read;
    
    // Hierarchy check: Must read before favoriting
    if (!isRead) {
      toast.warning(t("must_read_first_favorite"));
      return;
    }

    try {
      const response = await api.post('/user-book-relations/favorite', {
        user_id: currentUser.id || currentUser._id,
        book_id: bookId
      });

      if (response?.data?.status?.code === "0") {
        // API'den gelen güncel durumu kullan
        if (response?.data?.userBookRelations?.[0]) {
          setBookStatuses(prev => ({
            ...prev,
            [bookId]: {
              ...prev[bookId],
              like: response.data.userBookRelations[0].like,
              favorite: response.data.userBookRelations[0].favorite,
              read: response.data.userBookRelations[0].read,
              readingList: response.data.userBookRelations[0].readingList || response.data.userBookRelations[0].read_list
            }
          }));
          
          if (response.data.userBookRelations[0].favorite) {
            toast.success(t("added_to_favorites"));
          } else {
            toast.info(t("removed_from_favorites"));
          }

          // Real-time updates for ProfilePage
          if (window.refreshProfileFavoriteBooks) {
            window.refreshProfileFavoriteBooks();
          }
        }
      } 
    } catch (err) {
      toast.error(t("favorite_operation_failed"));
    }
  };

  const handleRead = async (book, event) => {
    event?.preventDefault();
    event?.stopPropagation();
    
    if (!currentUser) {
      toast.info(t("please_login_to_read"));
      return;
    }
    if (!book) return;

    const bookId = book.id || book._id;
    try {
      const response = await api.post('/user-book-relations/set-as-read', {
        user_id: currentUser.id || currentUser._id,
        book_id: bookId
      });

      if (response?.data?.status?.code === "0") {
        if (response?.data?.userBookRelations?.[0]) {
          setBookStatuses(prev => ({
            ...prev,
            [bookId]: {
              ...prev[bookId],
              like: response.data.userBookRelations[0].like,
              favorite: response.data.userBookRelations[0].favorite,
              read: response.data.userBookRelations[0].read,
              readingList: response.data.userBookRelations[0].readingList || response.data.userBookRelations[0].read_list
            }
          }));
          
          if (response.data.userBookRelations[0].read) {
            toast.success(t("marked_as_read_success"));
          } else {
            toast.info(t("read_mark_removed"));
          }

          // Real-time updates for ProfilePage
          if (window.refreshProfileReadList) {
            window.refreshProfileReadList();
          }
        }
      } 
    } catch (err) {
      toast.error(t("read_operation_failed"));
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
          alt={book.title || t("book")}
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
              {book.title || t("unknown_title")}
            </h3>
          </div>
          
          {/* Yazar adı */}
          <div className="relative z-10 mt-auto">
            <div className="h-px bg-white/30 mb-4"></div>
            <p className="text-sm opacity-90 font-medium text-center">
              {book.author || t("unknown_author")}
            </p>
          </div>
        </div>
      </div>
    );
  }, [getBookImage, t]);

  const renderSearchBookCard = (book) => {
    const imageUrl = getBookImage(book);
    const hasRealImage = imageUrl !== "/images/book-placeholder.png";
    const bookId = book.id || book._id;
    const isRead = bookStatuses[bookId]?.read;

    return (
      <div
        key={book._id || book.id}
        className="group relative bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300 hover:scale-105"
      >
        {/* Read Status - Sol üst köşe */}
        <div className="absolute top-2 left-2 z-10">
          <button
            className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-500 hover:scale-110 cursor-pointer ${bookStatuses[bookId]?.read
              ? 'bg-green-600/90 text-white shadow-lg shadow-green-500/30'
              : 'bg-gray-500/30 text-gray-400 hover:bg-gray-500/50'
              }`}
            onClick={(e) => handleRead(book, e)}
            title={bookStatuses[bookId]?.read ? t("remove_read_mark") : t("mark_as_read_button")}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
            </svg>
            {bookStatuses[bookId]?.read && (
              <span className="text-xs font-medium">{t("read_status")}</span>
            )}
          </button>
        </div>

        {/* Like/Favorite Buttons - Sağ üst köşe */}
        {isRead && (
          <div className="absolute top-2 right-2 flex gap-2 z-10">
            {/* Like Button */}
            <button
              className={`p-2 rounded-full transition-all duration-300 hover:scale-110 cursor-pointer ${bookStatuses[bookId]?.like
                ? 'bg-amber-800/90 text-white shadow-lg shadow-red-500/30'
                : 'bg-red-500/20 text-white/80 hover:bg-red-500/30'
                }`}
              onClick={(e) => handleLike(book, e)}
              title={bookStatuses[bookId]?.like ? t("remove_like") : t("like_book")}
            >
              <span className="text-xl">
                {bookStatuses[bookId]?.like ? '❤️' : '🤍'}
              </span>
            </button>
            
            {/* Favorite Button */}
            <button
              onClick={(e) => handleFavorite(book, e)}
              className={`p-2 rounded-full transition-all duration-300 hover:scale-110 cursor-pointer ${bookStatuses[bookId]?.favorite
                ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 text-yellow-300 shadow-lg shadow-yellow-500/20'
                : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/20'
                }`}
              title={bookStatuses[bookId]?.favorite ? t("remove_from_favorites") : t("add_to_favorites_button")}
            >
              <span className={`text-xl transition-all duration-300 ${bookStatuses[bookId]?.favorite ? 'animate-bounce' : 'group-hover:rotate-12'}`}>
                {bookStatuses[bookId]?.favorite ? '★' : '☆'}
              </span>
            </button>
          </div>
        )}

        <Link
          to={`/book/details?id=${book._id || book.id}`}
          className="block"
        >
          <div className="flex gap-4">
            {/* Book Cover */}
            <div className="relative w-16 h-24 rounded overflow-hidden flex-shrink-0">
              {hasRealImage ? (
                <img
                  src={imageUrl}
                  alt={book.title || t("book")}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 flex items-center justify-center text-white text-xs font-bold text-center p-1">
                  {book.title || "?"}
                </div>
              )}
            </div>

            {/* Book Info */}
            <div className="flex-1 min-w-0 pr-20">
              <h3 className="text-white font-semibold text-sm group-hover:text-blue-300 transition-colors line-clamp-2">
                {book.title || t("unknown_title")}
              </h3>
              <p className="text-white/70 text-xs mt-1">
                {book.author || t("unknown_author")}
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
      </div>
    );
  };

  return (
    <div
      className="relative min-h-screen bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/images/explore.png')" }}
    >
      <div className="absolute inset-0 bg-black/70 z-0"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 lg:py-24 space-y-8 sm:space-y-12 lg:space-y-16">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
            {query ? t("search_results") : t("explore_books")}
          </h1>
          <p className="text-base sm:text-lg text-white/80">
            {query 
              ? `${t("results_for")} "${query}"${searchResults.length > 0 ? ` • ${searchResults.length} ${t("books_found")}` : ''}`
              : t("discover_trending_reads")
            }
          </p>
        </div>

        {/* 🔍 Search Results */}
        {query && (
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">🔍 {t("search_results")}</h2>
            
            {searchLoading && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4 animate-bounce">🔍</div>
                <p className="text-lg">{t("searching_for")} "{query}"...</p>
              </div>
            )}

            {!searchLoading && searchResults.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-xl font-bold mb-2">{t("no_books_found_search")}</h3>
                <p className="text-white/70">
                  {t("no_books_match_search")} "{query}". {t("try_different_keywords")}
                </p>
              </div>
            )}

            {!searchLoading && searchResults.length > 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getPaginatedData(searchResults, "SearchResults").map(renderSearchBookCard)}
                </div>
                {renderPagination(searchResults, "SearchResults")}
              </div>
            )}
          </section>
        )}

        {/* Sadece arama yapılmıyorsa diğer bölümleri göster */}
        {!query && (
          <>
            {/* 📚 Most Read Books */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">📚 {t("most_read_books")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                      <div
                        key={book.id || book._id || index}
                        className="relative bg-white/10 backdrop-blur-md p-4 rounded-xl shadow hover:scale-105 transition-transform"
                      >
                        {/* Read Status - Sol üst köşe */}
                        <div className="absolute top-4 left-4 z-10">
                          <button
                            className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-500 hover:scale-110 cursor-pointer ${bookStatuses[book.id || book._id]?.read
                              ? 'bg-green-600/90 text-white shadow-lg shadow-green-500/30'
                              : 'bg-gray-500/30 text-gray-400 hover:bg-gray-500/50'
                              }`}
                            onClick={(e) => handleRead(book, e)}
                            title={bookStatuses[book.id || book._id]?.read ? t("remove_read_mark") : t("mark_as_read_button")}
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                            </svg>
                            {bookStatuses[book.id || book._id]?.read && (
                              <span className="text-xs font-medium">{t("read_status")}</span>
                            )}
                          </button>
                        </div>

                        {/* Like/Favorite Buttons - Sağ alt köşe */}
                        {bookStatuses[book.id || book._id]?.read && (
                          <div className="absolute bottom-4 right-4 flex gap-2 z-10">
                            {/* Like Button */}
                            <button
                              className={`p-2 rounded-full transition-all duration-300 hover:scale-110 cursor-pointer  transform ${bookStatuses[book.id || book._id]?.like
                                ? 'bg-amber-800/90 text-white shadow-lg shadow-red-500/30'
                                : 'bg-red-500/20 text-white/80 hover:bg-red-500/30'
                                }`}
                              onClick={(e) => handleLike(book, e)}
                              title={bookStatuses[book.id || book._id]?.like ? t("remove_like") : t("like_book")}
                            >
                              <span className="text-xl">
                                {bookStatuses[book.id || book._id]?.like ? '❤️' : '🤍'}
                              </span>
                            </button>
                            
                            {/* Favorite Button */}
                            <button
                              className={`p-2 rounded-full transition-all duration-300 hover:scale-110 cursor-pointer ${bookStatuses[book.id || book._id]?.favorite
                                ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 text-yellow-300 shadow-lg shadow-yellow-500/20'
                                : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/20'
                                }`}
                              onClick={(e) => handleFavorite(book, e)}
                              title={bookStatuses[book.id || book._id]?.favorite ? t("remove_from_favorites") : t("add_to_favorites_button")}
                            >
                              <span className={`text-xl transition-all duration-300 ${bookStatuses[book.id || book._id]?.favorite ? 'animate-bounce' : 'group-hover:rotate-12'}`}>
                                {bookStatuses[book.id || book._id]?.favorite ? '★' : '☆'}
                              </span>
                            </button>
                          </div>
                        )}

                        <Link
                          to={`/book/details?id=${book.id || book._id}`}
                          className="block"
                        >
                          {renderBookCover(book)}
                          <h3 className="text-lg font-semibold">{book.title || t("unknown_title")}</h3>
                          <p className="text-sm text-white/70">{t("by")} {book.author || t("unknown_author")}</p>
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
                      </div>
                    ))
                  : (
                    <div className="col-span-full text-center py-12">
                      <div className="text-6xl mb-4">📚</div>
                      <h3 className="text-xl font-semibold mb-2">{t("no_books_found_category")}</h3>
                      <p className="text-white/70">{t("check_back_later_books")}</p>
                    </div>
                  )}
              </div>
            </section>

            {/* 🗂️ Book Categories */}
            <section>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">🗂️ {t("book_categories")}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
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
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">💬 {t("user_recommendations")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
