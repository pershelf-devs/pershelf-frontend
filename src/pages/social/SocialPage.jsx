import React from "react";

// TODO: Bu kısımda arkadaşlarımızın yorumları gelecek
const reviews = [];

// TODO: Bu kısımda rastgele insanlar gözükecek
const members = [];

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

        {/* Reviews - Arkadaşların yorumları gelecek */}
        <section>
          <h2 className="text-3xl font-bold mb-8">Recent Reviews</h2>
          <div className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map((rev, index) => (
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
              ))
            ) : (
              <div className="bg-[#3b2316]/90 p-8 rounded-lg shadow text-center">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-xl font-semibold mb-2">Arkadaşlarının Yorumları</h3>
                <p className="text-[#d4c0aa]">Burada arkadaşlarının son yorumları görünecek</p>
              </div>
            )}
          </div>
        </section>

        {/* Featured Members - Rastgele insanlar gözükecek */}
        <section>
          <h2 className="text-3xl font-bold mb-8">Featured Members</h2>
          <div className="flex flex-wrap gap-10">
            {members.length > 0 ? (
              members.map((m, i) => (
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
              ))
            ) : (
              <div className="w-full bg-[#3b2316]/90 p-8 rounded-lg shadow text-center">
                <div className="text-4xl mb-4">🌟</div>
                <h3 className="text-xl font-semibold mb-2">Öne Çıkan Üyeler</h3>
                <p className="text-[#d4c0aa]">Burada rastgele kullanıcılar görünecek</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SocialPage;
