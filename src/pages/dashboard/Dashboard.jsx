import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { apiCache } from "../../utils/apiCache";
import { useSelector } from "react-redux";

// Remove mock data for popularBooks - we'll fetch from backend
// const popularBooks = [
//   { title: "1984", author: "George Orwell", image: "/images/book1.jpg" },
//   { title: "Sapiens", author: "Yuval Noah Harari", image: "/images/book2.jpg" },
//   { title: "The Book Thief", author: "Markus Zusak", image: "/images/book3.jpg" },
// ];

const popularReviews = [
  {
    user: "Mevlutcan",
    book: "1984",
    rating: 4.0,
    comment: "Gerçekten düşündürücü ama biraz ağırdı.",
    image: "/images/book1.jpg",
    likes: 32000,
  },
  {
    user: "Ataberk",
    book: "Sapiens",
    rating: 4.5,
    comment: "Tarihi bu kadar akıcı anlatmak büyük başarı!",
    image: "/images/book2.jpg",
    likes: 29900,
  },
];

const Dashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [popularBooks, setPopularBooks] = useState([]);
  const [popularReviews, setPopularReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    // Kullanıcı bilgilerini localStorage'dan al
    const userInfoStr = localStorage.getItem("userInfo");
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        setUserInfo(userInfo);
      } catch (error) {
        console.error("Error parsing user info:", error);
      }
    }

    // Global cache kontrolü
    const cacheKey = 'most-reads-3';
    const cachedData = apiCache.get(cacheKey);
    
    if (cachedData) {
      setPopularBooks(cachedData);
      setLoading(false);
      setReviewsLoading(false);
      return;
    }

    // Popular books'u backend'den çek
    axios
      .post("/api/books/discover/most-reads", { limit: 3 })
      .then(res => {
        if (res.data?.status?.code === "0") {
          const books = res.data.books || [];
          setPopularBooks(books);
          
          // Global cache'e kaydet
          apiCache.set(cacheKey, books);
        }
      })
      .catch(err => {
        console.error("API error:", err.response?.data || err.message);
      })
      .finally(() => {
        setLoading(false);
      });

    // TODO: Popular reviews API endpoint'i eklendiğinde bu kısım aktifleştirilecek
    // axios
    //   .post("/api/reviews/discover/popular", { limit: 3 })
    //   .then(res => {
    //     if (res.data?.status?.code === "0") {
    //       setPopularReviews(res.data.reviews || []);
    //     }
    //   })
    //   .catch(err => {
    //     console.error("Reviews API error:", err.response?.data || err.message);
    //   })
    //   .finally(() => setReviewsLoading(false));

    // Şimdilik reviews loading'i false yap
    setReviewsLoading(false);
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
      <div className="relative w-full h-48 rounded mb-3 overflow-hidden">
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
          className={`w-full h-full ${hasRealImage ? 'hidden' : 'flex'} bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 flex-col justify-between p-4 text-white relative overflow-hidden`}
          style={{ display: hasRealImage ? 'none' : 'flex' }}
        >
          {/* Arka plan deseni */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 left-2 w-6 h-6 border-2 border-white/30 rounded"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border border-white/30 rounded-full"></div>
          </div>
          
          {/* Kitap başlığı */}
          <div className="relative z-10 flex-1 flex items-center justify-center">
            <h3 className="text-sm font-bold leading-tight text-center line-clamp-3">
              {book.title || "Unknown Title"}
            </h3>
          </div>
          
          {/* Yazar adı */}
          <div className="relative z-10 mt-auto">
            <div className="h-px bg-white/30 mb-2"></div>
            <p className="text-xs opacity-90 font-medium text-center">
              {book.author || "Unknown Author"}
            </p>
          </div>
        </div>
      </div>
    );
  }, [getBookImage]);

  // Kullanıcı adını belirle
  const getUserDisplayName = () => {
    return `${currentUser?.name} ${currentUser?.surname}` || currentUser?.username || currentUser?.email || "User";
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center relative text-white"
      style={{ backgroundImage: "url('/images/dashboard.png')" }}
    >
      <div className="absolute inset-0 bg-black/70 z-0"></div>

      <div className="relative z-10 max-w-7xl mx-auto py-20 px-6">
        {/* Welcome Message */}
        <section className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Welcome back, {getUserDisplayName()}! 🎉</h2>
          <p className="text-white/80 text-lg">Here's what we've been reading 📚</p>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Decorative Panel */}
          <div className="lg:col-span-2 hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Reading Quote */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">📖</div>
                <p className="text-sm italic text-white/80">
                  "A reader lives a thousand lives before he dies"
                </p>
                <p className="text-xs text-white/60 mt-2">- George R.R. Martin</p>
              </div>
              
              {/* Stats Decoration */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <h3 className="font-bold mb-3 text-center">Your Journey</h3>
                <div className="space-y-3 text-center">
                  <div className="text-2xl">🏆</div>
                  <p className="text-xs text-white/70">Keep reading to unlock achievements!</p>
                </div>
              </div>

              {/* Reviews Section Extra */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <h3 className="font-bold mb-3 text-center">💭 Review Tips</h3>
                <div className="space-y-3 text-center">
                  <div className="text-2xl">✍️</div>
                  <p className="text-xs text-white/70">Share your honest thoughts and help others discover great reads!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* Popular Books */}
            <section>
              <h3 className="text-2xl font-semibold mb-6 text-center">📚 Popular This Month</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {loading
                  ? [...Array(3)].map((_, index) => (
                      <div
                        key={index}
                        className="bg-white/10 p-4 rounded-lg shadow text-center animate-pulse"
                      >
                        <div className="w-full h-48 bg-white/20 rounded mb-3"></div>
                        <div className="h-4 bg-white/20 rounded w-3/4 mx-auto mb-2"></div>
                        <div className="h-3 bg-white/10 rounded w-1/2 mx-auto"></div>
                      </div>
                    ))
                  : popularBooks.length > 0
                  ? popularBooks.map((book, index) => (
                      <Link 
                        key={book.id || book._id || index} 
                        to={`/book/details?id=${book.id || book._id}`}
                        className="bg-white/10 p-4 rounded-lg shadow text-center hover:bg-white/20 transition-all cursor-pointer block"
                      >
                        {renderBookCover(book)}
                        <h4 className="font-bold">{book.title || "Unknown Title"}</h4>
                        <p className="text-sm text-white/70">{book.author || "Unknown Author"}</p>
                      </Link>
                    ))
                  : (
                    <div className="col-span-full text-center py-12">
                      <div className="text-6xl mb-4">📚</div>
                      <h4 className="text-xl font-semibold mb-2">No popular books yet</h4>
                      <p className="text-white/70">Check back later!</p>
                    </div>
                  )}
              </div>
            </section>

            {/* Popular Reviews */}
            <section>
              <h3 className="text-2xl font-semibold mb-6 text-center">💬 Popular Reviews This Month</h3>
              {reviewsLoading ? (
                <div className="space-y-6">
                  {[...Array(2)].map((_, index) => (
                    <div
                      key={index}
                      className="bg-[#3b2316]/90 p-6 rounded-lg shadow animate-pulse"
                    >
                      <div className="flex gap-4 items-center">
                        <div className="w-24 h-36 bg-white/20 rounded"></div>
                        <div className="flex-1 space-y-3">
                          <div className="h-4 bg-white/20 rounded w-1/3"></div>
                          <div className="h-3 bg-white/20 rounded w-full"></div>
                          <div className="h-3 bg-white/20 rounded w-2/3"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : popularReviews.length > 0 ? (
                <div className="space-y-6">
                  {popularReviews.map((review, index) => (
                    <div
                      key={review._id || index}
                      className="bg-[#3b2316]/90 p-6 rounded-lg shadow flex gap-4 items-center"
                    >
                      <img
                        src={review.book?.image_url || review.image || "/images/book-placeholder.png"}
                        alt={review.book?.title || "Book"}
                        className="w-24 h-36 object-cover rounded"
                        onError={(e) => {
                          if (e.target.src !== window.location.origin + "/images/book-placeholder.png") {
                            e.target.src = "/images/book-placeholder.png";
                          }
                        }}
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold">@{review.user?.username || "Anonymous"}</span>
                          <span className="text-yellow-400">{review.rating?.toFixed(1) || "0.0"} / 5.0</span>
                        </div>
                        <p className="text-sm text-white/80 italic">"{review.comment || "No comment"}"</p>
                        <p className="text-xs text-white/60 mt-1">❤️ {(review.likes || 0).toLocaleString()} likes</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💬</div>
                  <h4 className="text-xl font-semibold mb-2">No reviews yet</h4>
                  <p className="text-white/70">Be the first to share your thoughts on a book!</p>
                </div>
              )}
            </section>
          </div>

          {/* Right Decorative Panel */}
          <div className="lg:col-span-2 hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Motivational */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">🌟</div>
                <h3 className="font-bold mb-2">Keep Reading!</h3>
                <p className="text-xs text-white/70">
                  Every page brings new adventures
                </p>
              </div>
              
              {/* Community */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">👥</div>
                <h3 className="font-bold mb-2">Join the Community</h3>
                <p className="text-xs text-white/70">
                  Share your thoughts with fellow readers
                </p>
              </div>

              {/* Rating Guide */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <h3 className="font-bold mb-3 text-center">⭐ Rating Guide</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>⭐⭐⭐⭐⭐</span>
                    <span>Amazing!</span>
                  </div>
                  <div className="flex justify-between">
                    <span>⭐⭐⭐⭐</span>
                    <span>Really good</span>
                  </div>
                  <div className="flex justify-between">
                    <span>⭐⭐⭐</span>
                    <span>It's okay</span>
                  </div>
                  <div className="flex justify-between">
                    <span>⭐⭐</span>
                    <span>Not great</span>
                  </div>
                  <div className="flex justify-between">
                    <span>⭐</span>
                    <span>Didn't like it</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
