import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";

const Category = () => {
  const {t} = useTranslation();
  const { name } = useParams(); // URL'den kategori adını al
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (name) {
      fetchBooksByGenre(name);
    }
  }, [name]);

  const fetchBooksByGenre = async (genre) => {
    setLoading(true);
    setError(null);
    
    // Genre'yi proper case'e çevir (her kelimenin ilk harfi büyük)
    const capitalizedGenre = genre
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    try {
      // Backend'ten o genre'a ait kitapları çek - capitalize edilmiş string gönder
      const response = await axios.post("/api/books/get/by-genre", capitalizedGenre, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = response.data;
      
      if (data.status?.code === "0" && Array.isArray(data.books)) {
        setBooks(data.books);
      } else if (Array.isArray(data)) {
        setBooks(data);
      } else if (data.books && Array.isArray(data.books)) {
        setBooks(data.books);
      } else {
        setBooks([]);
      }
    } catch (err) {
      setError("Failed to load books for this category. Please try again.");
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = useCallback(() => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="text-4xl mb-4 animate-bounce">📚</div>
          <p className="text-lg">{name} {t("loading_books")}</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">😞</div>
          <h2 className="text-xl font-bold mb-2">{t("error_loading_books")}</h2>
          <p className="text-white/70 mb-4">{error}</p>
          <button 
            onClick={() => fetchBooksByGenre(name)}
            className="bg-blue-500/20 hover:bg-blue-500/30 px-4 py-2 rounded-lg transition"
          >
            🔄 {t("try_again")}
          </button>
        </div>
      );
    }

    if (books.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📚</div>
          <h2 className="text-xl font-bold mb-2">No Books Found</h2>
          <p className="text-white/70 mb-4">
            {t("no_books_found_description")} {name}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map((book) => {
          // Resim URL'sini belirle
          let imageUrl = "/images/book-placeholder.png";
          
          if (book.image_base64 && book.image_base64.startsWith('data:image/')) {
            imageUrl = book.image_base64;
          } else if (book.image_url && book.image_url !== "" && !book.image_url.includes("placeholder")) {
            imageUrl = book.image_url;
          } else if (book.cover_image && book.cover_image !== "" && !book.cover_image.includes("placeholder")) {
            imageUrl = book.cover_image;
          } else if (book.image && book.image !== "" && !book.image.includes("placeholder")) {
            imageUrl = book.image;
          }

          const hasRealImage = imageUrl !== "/images/book-placeholder.png";

          return (
            <Link
              key={book._id || book.id}
              to={`/book/details?id=${book._id || book.id}`}
              className="group bg-white/10 backdrop-blur-md p-4 rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105"
            >
              {/* Book Cover */}
              <div className="relative w-full h-80 rounded-md mb-4 overflow-hidden">
                <img
                  src={imageUrl}
                  alt={book.title || t("books")}
                  className={`w-full h-full object-contain bg-gradient-to-br from-gray-800 to-gray-900 ${hasRealImage ? 'block' : 'hidden'}`}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                
                <div 
                  className={`w-full h-full ${hasRealImage ? 'hidden' : 'flex'} bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 flex-col justify-between p-6 text-white relative overflow-hidden`}
                  style={{ display: hasRealImage ? 'none' : 'flex' }}
                >
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-3 left-3 w-10 h-10 border-2 border-white/30 rounded"></div>
                    <div className="absolute bottom-3 right-3 w-8 h-8 border border-white/30 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-white/20 rounded-full"></div>
                  </div>
                  
                  <div className="relative z-10 flex-1 flex items-center justify-center">
                    <h3 className="text-lg font-bold leading-tight text-center line-clamp-4">
                      {book.title || t("unknown_title")}
                    </h3>
                  </div>
                  
                  <div className="relative z-10 mt-auto">
                    <div className="h-px bg-white/30 mb-4"></div>
                    <p className="text-sm opacity-90 font-medium text-center">
                      {book.author || t("unknown_author")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Book Info */}
              <div>
                <h3 className="text-white font-semibold text-lg group-hover:text-blue-300 transition-colors line-clamp-2 mb-2">
                  {book.title || t("unkown_title")}
                </h3>
                <p className="text-white/70 text-sm mb-2">
                  {book.author || t("unknown_author")}
                </p>
                
                {book.genre && (
                  <span className="inline-block bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded mb-2">
                    {book.genre}
                  </span>
                )}
                
                {book.published_year && (
                  <p className="text-white/60 text-sm mb-2">
                    {book.published_year}
                  </p>
                )}
                
                {book.rating && (
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400 text-sm">
                      {"★".repeat(Math.floor(book.rating))}
                      {"☆".repeat(5 - Math.floor(book.rating))}
                    </span>
                    <span className="text-white/60 text-sm">({book.rating})</span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    );
  }, [books, error, loading, name, t]);

  return (
    <div 
      className="relative min-h-screen bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/images/category-bg.png')" }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/70 z-0" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-8 py-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 capitalize">{name} {t("books")}</h1>
          <p className="text-white/70">
            {books.length > 0 
              ? `${books.length} books found in ${name} category`
              : `All books listed under "${name}" category will appear here.`
            }
          </p>
        </div>

        {renderContent()}

        {/* Back Navigation */}
        <div className="mt-8 text-center">
          <Link 
            to="/explore"
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition inline-block"
          >
            {t("back_to_explore")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Category;
