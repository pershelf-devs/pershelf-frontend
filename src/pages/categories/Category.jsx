import React from "react";
import { useParams } from "react-router-dom";

const Category = () => {
  const { name } = useParams(); // URL'den kategori adını al

  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-gray-800 to-black px-8 py-20">
      <h1 className="text-4xl font-bold mb-4 capitalize">{name} Books</h1>
      <p className="text-white/70 mb-10">All books listed under "{name}" category will appear here.</p>

      {/* Buraya backend'den fetch edilecek kitaplar gelecek */}
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((_, index) => (
          <div key={index} className="bg-white/10 backdrop-blur p-4 rounded-xl h-64 flex items-center justify-center text-lg text-white/50 italic">
            {name} {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Category;
