import React, { useEffect, useState } from "react";
import { api } from "../../api/api";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import BooksCard from '../../components/elements/BooksCard';
import usePagination from '../../hooks/usePagination.jsx';

const ProfilePage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('books');
  const { currentUser } = useSelector((state) => state.user);
  const [user, setUser] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [likedBooks, setLikedBooks] = useState([]);
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [readList, setReadList] = useState([]);
  const [userBooks, setUserBooks] = useState([]);

  // Takip sistemi state'leri
  const [followStats, setFollowStats] = useState({
    followers: 0,
    following: 0
  });

  // Pagination hook'u
  const { getPaginatedData, renderPagination } = usePagination(4);

  // Image upload states
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleProfileManagement = async (action, data = null) => {
    switch (action) {
      case 'fetchUser':
        try {
          const response = await api.post("/users/get/id", currentUser?.id);
          if (response?.data?.status?.code === "0") {
            setUser(response?.data?.users?.[0]);
          }
        } catch (error) {
          console.error("Kullanıcı bilgileri alınırken hata oluştu:", error);
        }
        break;

      case 'fetchReviews':
        setReviewsLoading(true);
        try {
          const response = await api.post(`/reviews/get/user-reviews`, currentUser?.id);
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
                // Hata durumunda review'ları kitap bilgisi olmadan göster
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
        break;

      case 'fetchLikedBooks':
        const res = await api.post('/books/get/user/liked-books', currentUser?.id || currentUser?._id);
        if (res?.data?.status?.code === "0") {
          setLikedBooks(res?.data?.books || []);
        }
        break;

      case 'fetchFavoriteBooks':
        const favoriteBooksResp = await api.post('/books/get/user/favorite-books', currentUser?.id || currentUser?._id);
        if (favoriteBooksResp?.data?.status?.code === "0") {
          setFavoriteBooks(favoriteBooksResp?.data?.books || []);
        }
        break;

      case 'fetchReadList':
          const readListResp = await api.post('/books/get/user/read-list', currentUser?.id || currentUser?._id);
          
          if (readListResp?.data?.status?.code === "0") {
            setReadList(readListResp?.data?.books || []);
          } 
        break;

      case 'fetchUserBooks':
        try {
          const userBooksResp = await api.post('/books/get/user/read-books', currentUser?.id || currentUser?._id);
          if (userBooksResp?.data?.status?.code === "0") {
            setUserBooks(userBooksResp?.data?.books || []);
          } else {
            setUserBooks([]);
          }
        } catch (error) {
          console.error("User books alınırken hata oluştu:", error);
          setUserBooks([]);
        }
        break;

      case 'fetchFollowStats':
        try {
          const response = await api.post("/users/get/follow-stats", currentUser?.id);
          if (response?.data?.status?.code === "0") {
            setFollowStats({
              followers: response.data.followers || 0,
              following: response.data.following || 0
            });
          } else {
            // API'den başarısız response geldi
            setFollowStats({
              followers: 0,
              following: 0
            });
          }
        } catch (error) {
          console.error("Takip istatistikleri alınırken hata:", error);
          setFollowStats({
            followers: 0,
            following: 0
          });
        }
        break;

      case 'handleImageSelect':
        const file = data;
        if (file) {
          if (file.size > 5 * 1024 * 1024) {
            alert(t("profile_photo_size_error"));
            return;
          }

          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result;
            setSelectedImage(base64String);
          };
          reader.readAsDataURL(file);
        }
        break;

      case 'handleSaveImage':
        if (!selectedImage) return;

        setIsSaving(true);
        try {
          const img = new Image();
          img.src = selectedImage;
          img.onload = async () => {
            const canvas = document.createElement('canvas');
            const MAX_SIZE = 500;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_SIZE) {
                height *= MAX_SIZE / width;
                width = MAX_SIZE;
              }
            } else {
              if (height > MAX_SIZE) {
                width *= MAX_SIZE / height;
                height = MAX_SIZE;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.8);

            const response = await api.post("/users/update/profile-photo", {
              user_id: currentUser?.id,
              image_base64: optimizedBase64
            });
            setUser(prev => ({ ...prev, image_base64: optimizedBase64 }));
            setSelectedImage(null);
          };
        } catch (error) {
          console.error("Resim yükleme hatası:", error);
          alert(t("profile_photo_upload_error"));
        } finally {
          setIsSaving(false);
        }
        break;

      case 'handleRemoveImage':
        try {
          await api.post("/users/remove/image", {
            userId: currentUser?.id
          });
          setUser(prev => ({ ...prev, image_base64: null }));
        } catch (error) {
          console.error("Resim kaldırma hatası:", error);
          alert(t("profile_photo_remove_error"));
        }
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    handleProfileManagement('fetchUser');
    handleProfileManagement('fetchReviews');
    handleProfileManagement('fetchLikedBooks');
    handleProfileManagement('fetchFavoriteBooks');
    handleProfileManagement('fetchReadList');
    handleProfileManagement('fetchUserBooks');
    handleProfileManagement('fetchFollowStats');

    // Global refresh function for other components
    window.refreshProfileReadList = () => {
      handleProfileManagement('fetchReadList');
    };

    window.refreshProfileLikedBooks = () => {
      handleProfileManagement('fetchLikedBooks');
    };

    window.refreshProfileFavoriteBooks = () => {
      handleProfileManagement('fetchFavoriteBooks');
    };

    // Cleanup
    return () => {
      delete window.refreshProfileReadList;
      delete window.refreshProfileLikedBooks;
      delete window.refreshProfileFavoriteBooks;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#2a1a0f] text-[#f8f8f2] pt-16 bg-cover bg-center"
      style={{ backgroundImage: "url('/images/profile-settings-bg.png')" }}>
      <div className="max-w-5xl mx-auto p-6">
        {/* Kullanıcı Bilgisi */}
        <div className="flex items-center gap-6 mb-12">
          <div className="relative p-1 group">
            <div className="w-24 h-24 bg-[#3b2316] rounded-full flex items-center justify-center text-3xl overflow-hidden border-2 border-[#a65b38]">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={t("profile_photo_selected")}
                  className="w-full h-full object-cover object-center"
                  style={{ imageRendering: 'auto' }}
                />
              ) : user?.image_base64 ? (
                <img
                  src={user?.image_base64 || currentUser?.image_base64}
                  alt="Profil"
                  className="w-full h-full object-cover object-center"
                  style={{ imageRendering: 'auto' }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">
                  <span className="text-gray-400">👤</span>
                </div>
              )}
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {user?.image_base64 && !selectedImage && (
                <button
                  onClick={() => handleProfileManagement('handleRemoveImage')}
                  className="bg-red-500 p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  title={t("profile_photo_remove")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
            <label
              htmlFor="image-upload"
              className="absolute bottom-1 right-1 bg-[#a65b38] p-2 rounded-full cursor-pointer hover:bg-[#8a4d32] transition-colors shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleProfileManagement('handleImageSelect', e.target.files[0])}
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold">@{user?.username}</h2>
            <p className="text-sm text-[#e5ded5]">
              {t("following")} {followStats.following} · {t("followers")} {followStats.followers}
            </p>
            {selectedImage && (
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleProfileManagement('handleSaveImage')}
                  disabled={isSaving}
                  className={`px-3 py-1 text-sm rounded-lg flex items-center gap-1 ${isSaving
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-[#a65b38] hover:bg-[#8a4d32]'
                    } transition-colors`}
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t("profile_photo_saving")}
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {t("profile_photo_save")}
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {t("profile_photo_cancel")}
                </button>
              </div>
            )}
          </div>
        </div>


        {/* Favori Kitaplar */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-4">{t("favorite_books")}</h3>
          <div className="flex gap-4 flex-wrap">
            {favoriteBooks.map((book, index) => (
              <BooksCard key={index} book={book} className="min-w-32" />
            ))}
          </div>
        </div>

        {/* Sekmeler */}
        <div className="flex gap-6 mb-6 border-b border-[#a65b38] text-sm">
          {[
            { key: "Books", label: t("books") },
            { key: "Likes", label: t("likes") },
            { key: "Reviews", label: t("reviews") },
            { key: "Readlist", label: t("readlist") }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-2 ${activeTab === tab.key
                ? "font-bold border-b-2 border-white text-white"
                : "text-[#d4c0aa]"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Kitap Listesi */}
        {activeTab === "Books" && (
          <div className="space-y-6">
            {userBooks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📖</div>
                <h3 className="text-xl font-semibold mb-2">{t("no_books_yet")}</h3>
                <p className="text-gray-400">{t("no_books_description")}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {getPaginatedData(userBooks, "Books").map((book, index) => (
                    <BooksCard key={index} book={book} />
                  ))}
                </div>
                {renderPagination(userBooks, "Books")}
              </>
            )}
          </div>
        )}

        {activeTab === "Likes" && (
          <div className="space-y-6">
            {likedBooks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💔</div>
                <h3 className="text-xl font-semibold mb-2">{t("no_liked_books_yet")}</h3>
                <p className="text-gray-400">{t("no_liked_books_description")}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {getPaginatedData(likedBooks, "Likes").map((book, index) => (
                    <BooksCard key={index} book={book} />
                  ))}
                </div>
                {renderPagination(likedBooks, "Likes")}
              </>
            )}
          </div>
        )}


        {/* Yorumlar */}
        {activeTab === "Reviews" && (
          <div className="space-y-6">
            {reviewsLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-400">{t("reviews_loading")}</p>
              </div>
            ) : userReviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💭</div>
                <h3 className="text-xl font-semibold mb-2">{t("no_reviews_yet_profile")}</h3>
                <p className="text-gray-400">{t("no_reviews_description")}</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {getPaginatedData(userReviews, "Reviews", 2).map((review) => (
                    <div
                      key={review.id}
                      className="p-4 bg-[#3b2316] rounded-md shadow-md"
                    >
                      <div className="flex gap-4">
                        {/* Kitap Kapağı */}
                        <div className="w-16 h-24 rounded overflow-hidden flex-shrink-0">
                          {review.book_image ? (
                            <img
                              src={review.book_image}
                              alt={review.book_title || "Book"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 flex items-center justify-center text-white text-xs font-bold text-center p-1">
                              {review.book_title || "?"}
                            </div>
                          )}
                        </div>

                        {/* Review İçeriği */}
                        <div className="flex-1">
                          {/* Kitap Bilgileri */}
                          <div className="mb-3">
                            <h3 className="font-semibold text-lg text-white">
                              {review.book_title || t("book_title_missing")}
                            </h3>
                            <p className="text-sm text-gray-300">
                              by {review.book_author || t("unknown_author")}
                            </p>
                          </div>

                          {/* Review Başlığı */}
                          <h4 className="text-md font-semibold text-[#f8f8f2] mb-2">
                            {review.review_title || t("review_title_missing")}
                          </h4>

                          {/* Review Metni */}
                          <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                            {review.review_text || t("review_text_missing")}
                          </p>

                          {/* Rating ve Tarih */}
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-400 text-sm">
                                {"★".repeat(Math.floor(review.rating || 0))}
                                {"☆".repeat(5 - Math.floor(review.rating || 0))}
                              </span>
                              <span className="text-xs text-gray-400 ml-1">
                                ({review.rating || 0}/5)
                              </span>
                            </div>
                            <span className="text-xs text-gray-400">
                              {review.created_at
                                ? new Date(review.created_at).toLocaleDateString("tr-TR")
                                : t("date_missing")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {renderPagination(userReviews, "Reviews", 2)}
              </>
            )}
          </div>
        )}

        {/* Okuma Listesi */}
        {activeTab === "Readlist" && (
          <div className="space-y-6">
            {readList.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold mb-2">{t("no_readlist_books")}</h3>
                <p className="text-gray-400">{t("no_readlist_description")}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {getPaginatedData(readList, "Readlist").map((book, index) => (
                    <BooksCard key={index} book={book} />
                  ))}
                </div>
                {renderPagination(readList, "Readlist")}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
