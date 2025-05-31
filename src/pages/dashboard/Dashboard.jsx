import React, { useState, useEffect } from "react";
import axios from "axios";

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
  const [loading, setLoading] = useState(true);

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

    // Popular books'u backend'den çek
    axios
      .post("/api/books/discover/most-reads", { limit: 3 })
      .then(res => {
        if (res.data?.status?.code === "0") {
          setPopularBooks(res.data.books || []);
        }
      })
      .catch(err => {
        console.error("API error:", err.response?.data || err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  // Kullanıcı adını belirle
  const getUserDisplayName = () => {
    if (!userInfo) return "User";
    
    if (userInfo.name && userInfo.surname) {
      return `${userInfo.name} ${userInfo.surname}`;
    } else if (userInfo.name) {
      return userInfo.name;
    } else if (userInfo.username) {
      return userInfo.username;
    } else if (userInfo.email) {
      return userInfo.email;
    }
    return "User";
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center relative text-white"
      style={{ backgroundImage: "url('/images/dashboard.png')" }}
    >
      <div className="absolute inset-0 bg-black/70  z-0"></div>

      <div className="relative z-10 max-w-6xl mx-auto py-20 px-6 space-y-16">
        {/* Welcome Message */}
        <section>
          <h2 className="text-3xl font-bold mb-2">Welcome back, {getUserDisplayName()}!</h2>
          <p className="text-white/80">Here's what we've been reading 📚</p>
        </section>

        {/* Popular Books */}
        <section>
          <h3 className="text-2xl font-semibold mb-6">Popular This Month</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
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
                  <div key={book._id || index} className="bg-white/10 p-4 rounded-lg shadow text-center">
                    <img
                      src={book.image_url || book.image || "/images/book-placeholder.png"}
                      alt={book.title || "Book"}
                      className="w-full h-48 object-cover rounded mb-3"
                      onError={(e) => {
                        e.target.src = "/images/book-placeholder.png";
                      }}
                    />
                    <h4 className="font-bold">{book.title || "Unknown Title"}</h4>
                    <p className="text-sm text-white/70">{book.author || "Unknown Author"}</p>
                  </div>
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
          <h3 className="text-2xl font-semibold mb-6">Popular Reviews This Month</h3>
          <div className="space-y-6">
            {popularReviews.map((rev, index) => (
              <div
                key={index}
                className="bg-[#3b2316]/90 p-6 rounded-lg shadow flex gap-4 items-center"
              >
                <img
                  src={rev.image}
                  alt={rev.book}
                  className="w-24 h-36 object-cover rounded"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">@{rev.user}</span>
                    <span className="text-yellow-400">{rev.rating.toFixed(1)} / 5.0</span>
                  </div>
                  <p className="text-sm text-white/80 italic">"{rev.comment}"</p>
                  <p className="text-xs text-white/60 mt-1">❤️ {rev.likes.toLocaleString()} likes</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
