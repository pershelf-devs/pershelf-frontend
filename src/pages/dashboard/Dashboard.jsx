import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { apiCache } from "../../utils/apiCache";

const Dashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [popularBooks, setPopularBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestedBook, setSuggestedBook] = useState(null);

  useEffect(() => {
    const userInfoStr = localStorage.getItem("userInfo");
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        setUserInfo(userInfo);
      } catch (error) {
        console.error("Error parsing user info:", error);
      }
    }

    const cacheKey = 'most-reads-3';
    const cachedData = apiCache.get(cacheKey);

    if (cachedData) {
      setPopularBooks(cachedData);
      setSuggestedBook(cachedData[Math.floor(Math.random() * cachedData.length)]);
      setLoading(false);
      return;
    }

    axios
      .post("/api/books/discover/most-reads", { limit: 4 })
      .then(res => {
        if (res.data?.status?.code === "0") {
          const books = res.data.books || [];
          setPopularBooks(books);
          apiCache.set(cacheKey, books);
          setSuggestedBook(books[Math.floor(Math.random() * books.length)]);
        }
      })
      .catch(err => {
        console.error("API error:", err.response?.data || err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getBookImage = useCallback((book) => {
    if (book.image_base64 && book.image_base64.startsWith('data:image/')) {
      return book.image_base64;
    }
    if (book.image_url && book.image_url !== "" && !book.image_url.includes("placeholder")) {
      return book.image_url;
    }
    if (book.image && book.image !== "" && !book.image.includes("placeholder")) {
      return book.image;
    }
    if (book.cover_image && book.cover_image !== "" && !book.cover_image.includes("placeholder")) {
      return book.cover_image;
    }
    return "/images/book-placeholder.png";
  }, []);

  const renderBookCover = useCallback((book) => {
    const imageUrl = getBookImage(book);
    const hasRealImage = imageUrl !== "/images/book-placeholder.png";

    return (
      <div className="relative w-full h-48 rounded mb-3 overflow-hidden">
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
          className={`w-full h-full ${hasRealImage ? 'hidden' : 'flex'} bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 flex-col justify-between p-4 text-white relative overflow-hidden`}
          style={{ display: hasRealImage ? 'none' : 'flex' }}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 left-2 w-6 h-6 border-2 border-white/30 rounded"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border border-white/30 rounded-full"></div>
          </div>
          <div className="relative z-10 flex-1 flex items-center justify-center">
            <h3 className="text-sm font-bold leading-tight text-center line-clamp-3">
              {book.title || "Unknown Title"}
            </h3>
          </div>
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

  const getUserDisplayName = () => {
    if (!userInfo) return "User";
    if (userInfo.name && userInfo.surname) return `${userInfo.name} ${userInfo.surname}`;
    if (userInfo.name) return userInfo.name;
    if (userInfo.username) return userInfo.username;
    if (userInfo.email) return userInfo.email;
    return "User";
  };

  return (
    <div className="min-h-screen bg-cover bg-center relative text-white" style={{ backgroundImage: "url('/images/dashboard.png')" }}>
      <div className="absolute inset-0 bg-black/70 z-0"></div>

      <div className="relative z-10 max-w-[1440px] w-full mx-auto py-20 px-6 md:px-10 xl:px-20">
        <section className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Welcome back, {getUserDisplayName()}! 🎉</h2>
          <p className="text-white/80 text-lg">Here's what we've been reading 📚</p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14">

          <div className="lg:col-span-3 hidden lg:block">
            {suggestedBook && (
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center shadow-xl">
                <h3 className="font-bold mb-3 text-xl">📌 Pick of the Day</h3>
                <img
                  src={getBookImage(suggestedBook)}
                  alt={suggestedBook.title}
                  className="w-24 h-36 object-cover rounded mx-auto shadow-md mb-3"
                />
                <h4 className="font-semibold text-white">{suggestedBook.title}</h4>
                <p className="text-sm text-white/70 italic">{suggestedBook.author}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-6 space-y-16">
            <section>
              <h3 className="text-2xl font-semibold mb-6 text-left">📚 Popular This Month</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading
                  ? [...Array(3)].map((_, index) => (
                      <div key={index} className="bg-white/10 p-4 rounded-lg shadow text-center animate-pulse">
                        <div className="w-full h-48 bg-white/20 rounded mb-3"></div>
                        <div className="h-4 bg-white/20 rounded w-3/4 mx-auto mb-2"></div>
                        <div className="h-3 bg-white/10 rounded w-1/2 mx-auto"></div>
                      </div>
                    ))
                  : popularBooks.length > 0
                  ? popularBooks.map((book, index) => (
                      <Link key={book.id || book._id || index} to={`/book/details?id=${book.id || book._id}`} className="bg-white/10 p-4 rounded-lg shadow text-center hover:bg-white/20 hover:scale-[1.02] transition-transform duration-200 cursor-pointer block">
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
          </div>

          <div className="lg:col-span-3 hidden lg:block">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">📖</div>
                <p className="text-sm italic text-white/80">
                  "A reader lives a thousand lives before he dies"
                </p>
                <p className="text-xs text-white/60 mt-2">- George R.R. Martin</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                <h3 className="font-bold mb-3 text-center">Your Journey</h3>
                <div className="space-y-3 text-center">
                  <div className="text-2xl">🏆</div>
                  <p className="text-xs text-white/70">Keep reading to unlock achievements!</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">🌟</div>
                <h3 className="font-bold mb-2">Keep Reading!</h3>
                <p className="text-xs text-white/70">
                  Every page brings new adventures
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">👥</div>
                <h3 className="font-bold mb-2">Join the Community</h3>
                <p className="text-xs text-white/70">
                  Share your thoughts with fellow readers
                </p>
              </div>
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