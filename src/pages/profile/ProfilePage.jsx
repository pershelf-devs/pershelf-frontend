import React, { useEffect, useState } from "react";
import { api } from "../../api/api";
import { useSelector } from "react-redux";
import axios from "axios";
import BooksCard from '../../components/elements/BooksCard';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("Books");
  const { currentUser } = useSelector((state) => state.user);
  const [user, setUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [userReviews, setUserReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [likedBooks, setLikedBooks] = useState([]);
  const [favoriteBooks, setFavoriteBooks] = useState([]);

  const bookList = ["1984", "The Book Thief", "Sapiens"];

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
          const response = await api.post(`/reviews/get/by-user`, currentUser?.id);
          if (response?.data?.status?.code === "0") {
            const reviewsData = response.data.reviews || [];
            
            // Benzersiz book_id'leri topla
            const bookIds = [...new Set(reviewsData.map(review => review.book_id))];
            
            // Kitap bilgilerini çek
            if (bookIds.length > 0) {
              try {
                const bookPromises = bookIds.map(bookId => 
                  axios.post("/api/books/get/id", parseInt(bookId), {
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

      case 'handleImageSelect':
        const file = data;
        if (file) {
          if (file.size > 5 * 1024 * 1024) {
            alert("Resim boyutu 5MB'dan küçük olmalıdır.");
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
          alert("Resim yüklenirken bir hata oluştu.");
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
          alert("Resim kaldırılırken bir hata oluştu.");
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
                  alt="Seçilen Profil"
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
                  title="Fotoğrafı Kaldır"
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
              Following {user?.following} · Followers {user?.followers}
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
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Kaydet
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  İptal
                </button>
              </div>
            )}
          </div>
        </div>


        {/* Favori Kitaplar */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-4">Favorite Books</h3>
          <div className="flex gap-4 flex-wrap">
            {favoriteBooks.map((book, index) => (
              <BooksCard key={index} book={book} className="min-w-64" />
            ))}
          </div>
        </div>

        {/* Sekmeler */}
        <div className="flex gap-6 mb-6 border-b border-[#a65b38] text-sm">
          {["Books", "Likes", "Reviews", "Readlist"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 ${activeTab === tab
                ? "font-bold border-b-2 border-white text-white"
                : "text-[#d4c0aa]"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Kitap Listesi */}
        {activeTab === "Books" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bookList.map((book, index) => (
              <div
                key={index}
                className="h-36 bg-white text-black rounded-md flex items-center justify-center text-center text-sm font-medium shadow"
              >
                {book?.title}
              </div>
            ))}
            <div className="h-36 border-2 border-dashed border-white rounded-md flex items-center justify-center text-2xl">
              +
            </div>
          </div>
        )}

        {activeTab === "Likes" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {likedBooks.map((book, index) => (
              <BooksCard key={index} book={book} />
            ))}
          </div>
        )}

        {/* Yorumlar */}
        {activeTab === "Reviews" && (
          <div className="mt-4">
            {reviewsLoading ? (
              <p className="text-center text-gray-400">Yorumlar yükleniyor...</p>
            ) : userReviews.length === 0 ? (
              <p className="text-center text-gray-400">Henüz yorumunuz yok.</p>
            ) : (
              <div className="space-y-4">
                {userReviews.map((review) => (
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
                            {review.book_title || "Kitap Başlığı Yok"}
                          </h3>
                          <p className="text-sm text-gray-300">
                            by {review.book_author || "Unknown Author"}
                          </p>
                        </div>

                        {/* Review Başlığı */}
                        <h4 className="text-md font-semibold text-[#f8f8f2] mb-2">
                          {review.review_title || "Review Başlığı Yok"}
                        </h4>

                        {/* Review Metni */}
                        <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                          {review.review_text || "Yorum Yok"}
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
                              : "Tarih Yok"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
