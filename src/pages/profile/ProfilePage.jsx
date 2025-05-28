import React, { useState } from "react";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("Books");

  const user = {
    username: "Mevlutcan",
    followers: 0,
    following: 0,
  };

  const favoriteBooks = ["1984", "The Book Thief", "Sapiens"];
  const bookList = ["1984", "The Book Thief", "Sapiens"];

  return (
    <div className="min-h-screen bg-[#2a1a0f] text-[#f8f8f2]">
      <div className="max-w-5xl mx-auto p-6">

        {/* Kullanıcı Bilgisi */}
        <div className="flex items-center gap-6 mb-12">
          <div className="w-24 h-24 bg-[#3b2316] rounded-full flex items-center justify-center text-3xl">
            👤
          </div>
          <div>
            <h2 className="text-2xl font-bold">@{user.username}</h2>
            <p className="text-sm text-[#e5ded5]">
              Following {user.following} · Followers {user.followers}
            </p>
          </div>
        </div>

        {/* Favori Kitaplar */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-4">Favorite Books</h3>
          <div className="flex gap-4 flex-wrap">
            {favoriteBooks.map((book, index) => (
              <div
                key={index}
                className="w-24 h-36 bg-white text-black rounded-md flex items-center justify-center text-center text-sm font-medium shadow"
              >
                {book}
              </div>
            ))}
          </div>
        </div>

        {/* Sekmeler */}
        <div className="flex gap-6 mb-6 border-b border-[#a65b38] text-sm">
          {["Books", "Likes", "Reviews", "Lists", "Readlist"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 ${
                activeTab === tab
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
                {book}
              </div>
            ))}
            <div className="h-36 border-2 border-dashed border-white rounded-md flex items-center justify-center text-2xl">
              +
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
