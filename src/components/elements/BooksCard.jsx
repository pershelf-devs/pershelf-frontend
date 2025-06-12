import React from 'react';
import { Link } from 'react-router-dom';

const BooksCard = ({ book, className = '' }) => {
  return (
    <Link
      key={book._id || book.id}
      to={`/book/details?id=${book?.id}`}
      className="group block bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300 hover:scale-105"
    >
      <div className={`bg-[#23212b] rounded-xl shadow-lg flex flex-col items-center justify-between p-4 h-80 w-full max-w-xs mx-auto ${className}`}>
        <div className="flex-1 flex items-center justify-center w-full">
          {book?.image_base64 ? (
            <img
              src={book?.image_base64}
              alt={book?.title}
              className="max-h-56 max-w-full object-contain rounded-md bg-white"
            />
          ) : book?.image_base64 ? (
            <img
              src={book?.image_base64.startsWith('data:') ? book?.image_base64 : `data:image/jpeg;base64,${book.image_base64}`}
              alt={book?.title}
              className="max-h-56 max-w-full object-contain rounded-md bg-white"
            />
          ) : (
            <div className="w-32 h-48 bg-gray-200 flex items-center justify-center rounded-md">
              <span className="text-4xl text-gray-400">📚</span>
            </div>
          )}
        </div>
        <div className="w-full mt-4 text-left">
          <h3 className="text-lg font-bold text-white truncate">{book?.title}</h3>
          <p className="text-sm text-gray-300 mt-1 truncate">by {book?.author}</p>
        </div>
      </div>
    </Link>
  );
};

export default BooksCard;