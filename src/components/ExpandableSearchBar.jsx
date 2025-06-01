import { useState, useRef, useEffect } from "react";
import { FiSearch, FiX } from "react-icons/fi";

export default function ExpandableSearchBar({ onSearch }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setQuery("");
      setIsOpen(false);
    }
  };

  const handleClickOutside = (e) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="text-gray-400 hover:text-white"
        >
          <FiSearch size={20} />
        </button>
      )}

      {isOpen && (
        <form
          onSubmit={handleSearch}
          className="flex items-center bg-black rounded-full pl-3 pr-2 py-1 shadow-md w-64 transition-all"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            placeholder="Search books..."
            className="flex-grow bg-transparent outline-none text-red placeholder-gray-400"
          />
          <button type="submit" className="text-gray-500 hover:text-blue-600">
            <FiSearch size={18} />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setQuery("");
            }}
            className="text-gray-400 ml-2 hover:text-red-500"
          >
            <FiX size={18} />
          </button>
        </form>
      )}
    </div>
  );
}
