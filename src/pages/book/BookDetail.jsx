import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const BookDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);

  useEffect(() => {
    const mockData = {
      1: {
        title: "1984",
        author: "George Orwell",
        year: 1949,
        rating: 4.3,
        description:
          "1984, totaliter bir rejimde bireyin yaşadığı baskıları konu alır. George Orwell'in bu eseri politik alegorinin en etkili örneklerinden biridir.",
        image: "/images/book1.jpg",
      },
      2: {
        title: "Sapiens",
        author: "Yuval Noah Harari",
        year: 2011,
        rating: 4.7,
        description:
          "Sapiens, insan türünün evrimini, toplumsal dönüşümleri ve kültürel gelişimini ele alan etkileyici bir kitaptır.",
        image: "/images/book2.jpg",
      },
    };

    setBook(mockData[id]); // Daha sonra API ile değişecek
  }, [id]);

  if (!book) {
    return (
      <div className="min-h-screen bg-[#2a1a0f] text-white flex items-center justify-center">
        <p className="text-lg">Loading book details...</p>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/images/book-bg.png')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 z-0" />

      {/* İçerik */}
      <div className="relative z-10 py-20 px-6 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-10 items-start">
          {/* Poster */}
          <img
            src={book.image}
            alt={book.title}
            className="w-48 h-72 object-cover rounded shadow-lg"
          />

          {/* Kitap Bilgileri */}
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold">{book.title}</h1>
            <p className="text-white/70 text-sm">
              by {book.author} • {book.year}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-lg">
                {"★".repeat(Math.floor(book.rating))}
                {"☆".repeat(5 - Math.floor(book.rating))}
              </span>
              <span className="text-white/80 text-sm">({book.rating}/5)</span>
            </div>

            {/* Description */}
            <p className="text-white/90">{book.description}</p>

            {/* Butonlar */}
            <div className="flex gap-4 mt-6">
              <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full">
                ❤️ Like
              </button>
              <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full">
                ➕ Add to Reading List
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
