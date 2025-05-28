import React from "react";

const reviews = [
  { user: "Mevlutcan", book: "1984", rating: 3, comment: "Gerçekten düşündürücü ama biraz ağırdı." },
  { user: "Ataberk", book: "Sapiens", rating: 5, comment: "Tarihi bu kadar akıcı anlatmak büyük başarı!" },
];

const members = [
  {
    name: "Mevlutcan",
    avatar: "https://via.placeholder.com/100",
    books: 120,
    reviews: 45,
    favorites: ["1984", "The Book Thief", "Sapiens"],
  },
  {
    name: "Ataberk",
    avatar: "https://via.placeholder.com/100",
    books: 80,
    reviews: 20,
    favorites: ["Sapiens", "Brave New World", "Dune"],
  },
];

const SocialPage = () => {
  return (
    <div
      className="min-h-screen bg-cover bg-center relative text-[#f8f8f2]"
      style={{ backgroundImage: "url('/images/social-bg.png')" }} // 📌 arka plan fotoğrafı
    >
      {/* Siyah transparan overlay */}
      <div className="absolute inset-0 bg-black/70  z-0"></div>

      {/* İçerik */}
      <div className="relative z-10 max-w-6xl mx-auto py-20 px-6 space-y-16">

        {/* Reviews */}
        <section>
          <h2 className="text-3xl font-bold mb-8">Recent Reviews</h2>
          <div className="space-y-6">
            {reviews.map((rev, index) => (
              <div key={index} className="bg-[#3b2316]/90 p-6 rounded-lg shadow space-y-2">
                <p>
                  <span className="font-bold text-white">{rev.user}</span> reviewed{" "}
                  <span className="italic">{rev.book}</span>
                </p>
                <div className="text-yellow-400">
                  {"★".repeat(rev.rating)}
                  {"☆".repeat(5 - rev.rating)}
                </div>
                <p className="text-sm text-[#e5ded5]">{rev.comment}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Members */}
        <section>
          <h2 className="text-3xl font-bold mb-8">Featured Members</h2>
          <div className="flex flex-wrap gap-10">
            {members.map((m, i) => (
              <div key={i} className="text-center w-40">
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="w-24 h-24 mx-auto rounded-full object-cover mb-2 border-2 border-white"
                />
                <h3 className="font-semibold text-white">{m.name}</h3>
                <p className="text-sm text-[#d4c0aa]">{m.books} books · {m.reviews} reviews</p>
                <div className="flex gap-1 mt-2 justify-center flex-wrap">
                  {m.favorites.map((fav, idx) => (
                    <div
                      key={idx}
                      className="bg-white/10 text-xs rounded-md px-2 py-1 text-white whitespace-nowrap"
                    >
                      {fav}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SocialPage;
