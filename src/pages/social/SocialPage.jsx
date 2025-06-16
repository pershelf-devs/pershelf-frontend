import React, { useEffect, useState } from "react";
import { api } from "../../api/api";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import NotificationService from '../../utils/notificationService';
import usePagination from '../../hooks/usePagination.jsx';

const SocialPage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(true);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [friendsReviews, setFriendsReviews] = useState([]);
  const [randomMembers, setRandomMembers] = useState([]);
  
  // Pagination hook'u
  const { getPaginatedData, renderPagination } = usePagination(5);

  // Takip edilen kullanıcıları getir
  const fetchFollowingUsers = async () => {
    if (!currentUser) return;
    
    try {
      const response = await api.post("/follows/get/follower-users", currentUser.id);
      if (response?.data?.status?.code === "0") {
        const following = response.data.following || response.data.users || [];
        setFollowingUsers(following);
        return following;
      }
    } catch (error) {
      console.error("Takip edilen kullanıcılar alınırken hata:", error);
    }
    return [];
  };

  // Takip edilen kişilerin yorumlarını getir
  const fetchFriendsReviews = async (followingList) => {
    if (!followingList || followingList.length === 0) return;
    
    try {
      const reviewPromises = followingList.map(async (user) => {
        const userId = user.id || user.user_id || user._id;
        try {
          const response = await api.post(`/reviews/get/user-reviews`, userId);
          if (response?.data?.status?.code === "0") {
            const userReviews = response.data.reviews || [];
            // Her review'a kullanıcı bilgisini ekle
            return userReviews.map(review => ({
              ...review,
              user_name: user.username || user.name || 'Unknown User',
              user_image: user.image_base64,
              user_id: userId
            }));
          }
        } catch (error) {
          console.error(`User ${userId} reviews fetch error:`, error);
        }
        return [];
      });

      const allReviewsArrays = await Promise.all(reviewPromises);
      const allReviews = allReviewsArrays.flat();
      
      // Tarihe göre sırala (en yeni en üstte)
      const sortedReviews = allReviews.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );

      // Her review için kitap bilgilerini getir
      const reviewsWithBooks = await Promise.all(
        sortedReviews.map(async (review) => { // Tüm review'ları al, pagination frontend'de yapılacak
          try {
            const bookResponse = await api.post("/books/get/id", parseInt(review.book_id), {
              headers: { "Content-Type": "application/json" }
            });
            const bookData = bookResponse.data?.books?.[0] || bookResponse.data;
            
            return {
              ...review,
              book_title: bookData?.title || `Book ${review.book_id}`,
              book_author: bookData?.author || 'Unknown Author',
              book_image: bookData?.image_base64 || bookData?.image_url
            };
          } catch (error) {
            console.error(`Book ${review.book_id} fetch error:`, error);
            return {
              ...review,
              book_title: `Book ${review.book_id}`,
              book_author: 'Unknown Author',
              book_image: null
            };
          }
        })
      );

      setFriendsReviews(reviewsWithBooks);
    } catch (error) {
      console.error("Arkadaş yorumları alınırken hata:", error);
    }
  };

  // Rastgele üyeleri getir (henüz takip etmediğin kişiler)
  const fetchRandomMembers = async () => {
    try {
      // Basit bir yaklaşım: Son kayıt olan kullanıcıları getir
      const response = await api.post("/users/get/all", {});
      if (response?.data?.status?.code === "0") {
        const allUsers = response.data.users || [];
        // Mevcut kullanıcıyı ve takip edilenleri çıkar
        const followingIds = followingUsers.map(user => user.id || user.user_id || user._id);
        const availableUsers = allUsers.filter(user => 
          (user.id || user._id) !== currentUser?.id && 
          !followingIds.includes(user.id || user._id)
        );
        
        // Rastgele 6 kişi seç
        const shuffled = availableUsers.sort(() => 0.5 - Math.random());
        setRandomMembers(shuffled.slice(0, 6));
      }
    } catch (error) {
      console.error("Rastgele üyeler alınırken hata:", error);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const loadSocialData = async () => {
      setLoading(true);
      const following = await fetchFollowingUsers();
      await fetchFriendsReviews(following);
      await fetchRandomMembers();
      setLoading(false);
    };

    loadSocialData();
  }, [currentUser]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 60) {
      return `${diffInMins} dakika önce`;
    } else if (diffInHours < 24) {
      return `${diffInHours} saat önce`;
    } else if (diffInDays < 7) {
      return `${diffInDays} gün önce`;
    } else {
      return date.toLocaleDateString('tr-TR');
    }
  };

  const getUserImage = (user) => {
    if (user?.image_base64 && user.image_base64.startsWith('data:image/')) {
      return user.image_base64;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || user?.name || 'User')}&background=6366f1&color=fff&size=128`;
  };

  if (!currentUser) {
    return (
      <div
        className="min-h-screen bg-cover bg-center relative text-[#f8f8f2] flex items-center justify-center"
        style={{ backgroundImage: "url('/images/social-bg.png')" }}
      >
        <div className="absolute inset-0 bg-black/70 z-0"></div>
        <div className="relative z-10 text-center px-4">
          <div className="text-4xl sm:text-6xl mb-4">🔐</div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">{t("login_required_social")}</h2>
          <p className="text-white/70 mb-4 text-sm sm:text-base">{t("login_for_social")}</p>
          <Link to="/auth" className="bg-white text-gray-900 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-gray-100 transition text-sm sm:text-base">
            {t("login")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center relative text-[#f8f8f2]"
      style={{ backgroundImage: "url('/images/social-bg.png')" }} // 📌 arka plan fotoğrafı
    >
      {/* Siyah transparan overlay */}
      <div className="absolute inset-0 bg-black/70  z-0"></div>

      {/* İçerik */}
      <div className="relative z-10 max-w-6xl mx-auto py-8 sm:py-16 lg:py-20 px-4 sm:px-6 space-y-8 sm:space-y-12 lg:space-y-16">

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/70">{t("loading_social_content")}</p>
          </div>
        ) : (
          <>
            {/* Reviews - Takip edilen kişilerin yorumları */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">📚 {t("friends_recent_reviews")}</h2>
              <div className="space-y-4 sm:space-y-6">
                {friendsReviews.length > 0 ? (
                  <>
                                        {getPaginatedData(friendsReviews, "Reviews").map((review, index) => (
                      <div key={review.id || index} className="bg-white/10 backdrop-blur-md rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          {/* Kullanıcı Fotoğrafı */}
                          <Link to={`/user/profile?id=${review.user_id}`} className="flex-shrink-0">
                            <img
                              src={getUserImage({ image_base64: review.user_image, username: review.user_name })}
                              alt={review.user_name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-white/20 hover:border-white/40 transition"
                            />
                          </Link>

                          {/* İçerik */}
                          <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex items-center gap-1 mb-2 flex-wrap">
                              <Link 
                                to={`/user/profile?id=${review.user_id}`}
                                className="font-semibold text-white hover:text-blue-300 transition text-sm"
                              >
                                {review.user_name}
                              </Link>
                              <span className="text-white/50 text-xs">•</span>
                              <Link 
                                to={`/book/details?id=${review.book_id}`}
                                className="font-medium text-blue-300 hover:text-blue-200 transition text-sm truncate"
                              >
                                {review.book_title}
                              </Link>
                              <span className="text-white/50 text-xs">•</span>
                              <span className="text-white/50 text-xs">{formatDate(review.created_at)}</span>
                            </div>

                            {/* Rating ve Başlık */}
                            <div className="flex items-center gap-2 mb-2">
                              <div className="text-yellow-400 text-sm">
                                {"★".repeat(Math.floor(review.rating))}
                                {"☆".repeat(5 - Math.floor(review.rating))}
                              </div>
                              <span className="font-medium text-white text-sm">{review.review_title || t("untitled_comment")}</span>
                            </div>

                            {/* Review Content */}
                            <p className="text-white/80 text-sm leading-relaxed mb-3 line-clamp-3">{review.review_text}</p>

                            {/* Kitap Bilgisi - Compact */}
                            <div className="flex items-center gap-2 p-2 bg-white/5 rounded">
                              <Link to={`/book/details?id=${review.book_id}`} className="flex-shrink-0">
                                {review.book_image ? (
                                  <img
                                    src={review.book_image}
                                    alt={review.book_title}
                                    className="w-8 h-12 object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-8 h-12 bg-gradient-to-br from-blue-600 to-purple-700 rounded flex items-center justify-center text-white text-xs font-bold text-center">
                                    {review.book_title.substring(0, 2)}
                                  </div>
                                )}
                              </Link>
                              <div className="min-w-0 flex-1">
                                <Link 
                                  to={`/book/details?id=${review.book_id}`}
                                  className="font-medium text-white hover:text-blue-300 transition text-xs block truncate"
                                >
                                  {review.book_title}
                                </Link>
                                <p className="text-white/60 text-xs truncate">{review.book_author}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {renderPagination(friendsReviews, "Reviews")}
                  </>
                ) : (
                  <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl text-center">
                    <div className="text-4xl mb-4">👥</div>
                    <h3 className="text-xl font-semibold mb-2">{t("no_friend_reviews_yet")}</h3>
                    <p className="text-white/70 mb-4">
                      {followingUsers.length === 0 
                        ? t("not_following_anyone")
                        : t("following_no_reviews")
                      }
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Featured Members - Keşfedilecek üyeler */}
            <section>
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">🌟 {t("discoverable_members")}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
                {randomMembers.length > 0 ? (
                  randomMembers.map((member, index) => (
                    <div key={member.id || member._id || index} className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center hover:bg-white/15 transition">
                      <Link to={`/user/profile?id=${member.id || member._id}`} className="block">
                        <img
                          src={getUserImage(member)}
                          alt={member.username || member.name}
                          className="w-16 h-16 mx-auto rounded-full object-cover mb-3 border-2 border-white/20"
                        />
                        <h3 className="font-semibold text-white text-sm mb-1 truncate">
                          {member.username || member.name || 'Unknown User'}
                        </h3>
                        <p className="text-xs text-white/60 truncate">{member.email}</p>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full bg-white/10 backdrop-blur-md p-8 rounded-xl text-center">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold mb-2">{t("no_members_to_discover")}</h3>
                    <p className="text-white/70">{t("no_members_available")}</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default SocialPage;
