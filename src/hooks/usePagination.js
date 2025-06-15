import { useState } from 'react';

const usePagination = (initialItemsPerPage = 4) => {
  const [currentPages, setCurrentPages] = useState({});
  const [itemsPerPage] = useState(initialItemsPerPage);

  // Sayfa değiştirme fonksiyonu
  const handlePageChange = (tabName, pageNumber) => {
    setCurrentPages(prev => ({
      ...prev,
      [tabName]: pageNumber
    }));
  };

  // Mevcut sayfa numarasını al
  const getCurrentPage = (tabName) => {
    return currentPages[tabName] || 1;
  };

  // Sayfalanmış veriyi al
  const getPaginatedData = (data, tabName, customItemsPerPage = null) => {
    const pageSize = customItemsPerPage || itemsPerPage;
    const currentPage = getCurrentPage(tabName);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  };

  // Toplam sayfa sayısını hesapla
  const getTotalPages = (data, customItemsPerPage = null) => {
    const pageSize = customItemsPerPage || itemsPerPage;
    return Math.ceil(data.length / pageSize);
  };

  // Pagination bileşenini render et
  const renderPagination = (data, tabName, customItemsPerPage = null) => {
    const totalPages = getTotalPages(data, customItemsPerPage);
    const currentPage = getCurrentPage(tabName);
    
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          onClick={() => handlePageChange(tabName, currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ←
        </button>
        
        {[...Array(totalPages)].map((_, index) => {
          const pageNum = index + 1;
          return (
            <button
              key={pageNum}
              onClick={() => handlePageChange(tabName, pageNum)}
              className={`px-3 py-2 rounded-lg transition-colors ${
                currentPage === pageNum
                  ? 'bg-white text-gray-900'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
        
        <button
          onClick={() => handlePageChange(tabName, currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          →
        </button>
      </div>
    );
  };

  // Basit pagination (BookDetail.jsx için)
  const useSimplePagination = (initialPage = 1) => {
    const [currentPage, setCurrentPage] = useState(initialPage);

    const getSimplePaginatedData = (data, pageSize) => {
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      return data.slice(startIndex, endIndex);
    };

    const getSimpleTotalPages = (dataLength, pageSize) => {
      return Math.ceil(dataLength / pageSize);
    };

    const renderSimplePagination = (dataLength, pageSize) => {
      const totalPages = getSimpleTotalPages(dataLength, pageSize);
      if (totalPages <= 1) return null;

      return (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ←
          </button>
          
          {[...Array(totalPages)].map((_, index) => {
            const pageNum = index + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  currentPage === pageNum
                    ? 'bg-white text-gray-900'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            →
          </button>
        </div>
      );
    };

    return {
      currentPage,
      setCurrentPage,
      getSimplePaginatedData,
      getSimpleTotalPages,
      renderSimplePagination
    };
  };

  return {
    currentPages,
    itemsPerPage,
    handlePageChange,
    getCurrentPage,
    getPaginatedData,
    getTotalPages,
    renderPagination,
    useSimplePagination
  };
};

export default usePagination; 