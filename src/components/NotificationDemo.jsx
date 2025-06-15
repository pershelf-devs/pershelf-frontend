import React from 'react';
import NotificationService from '../utils/notificationService';

const NotificationDemo = () => {
  
  const testBasicNotifications = () => {
    setTimeout(() => NotificationService.success("Bu bir başarı mesajıdır!"), 0);
    setTimeout(() => NotificationService.error("Bu bir hata mesajıdır!"), 500);
    setTimeout(() => NotificationService.warning("Bu bir uyarı mesajıdır!"), 1000);
    setTimeout(() => NotificationService.info("Bu bir bilgi mesajıdır!"), 1500);
  };

  const testAuthNotifications = () => {
    setTimeout(() => NotificationService.auth.loginSuccess(), 0);
    setTimeout(() => NotificationService.auth.registerSuccess(), 500);
    setTimeout(() => NotificationService.auth.logoutSuccess(), 1000);
  };

  const testBookNotifications = () => {
    setTimeout(() => NotificationService.book.addSuccess(), 0);
    setTimeout(() => NotificationService.book.reviewSuccess(), 500);
    setTimeout(() => NotificationService.book.removeSuccess(), 1000);
  };

  const testSocialNotifications = () => {
    setTimeout(() => NotificationService.social.followSuccess("john_doe"), 0);
    setTimeout(() => NotificationService.social.likeSuccess(), 500);
    setTimeout(() => NotificationService.social.commentSuccess(), 1000);
  };

  const testErrorNotifications = () => {
    setTimeout(() => NotificationService.networkError(), 0);
    setTimeout(() => NotificationService.serverError(), 500);
    setTimeout(() => NotificationService.rateLimitError(), 1000);
  };

  const testLoadingNotification = () => {
    const loadingToast = NotificationService.loading("Test işlemi devam ediyor...");
    
    setTimeout(() => {
      NotificationService.dismiss(loadingToast);
      NotificationService.success("Test işlemi tamamlandı!");
    }, 3000);
  };

  const testProgressNotification = () => {
    let progress = 0;
    const progressToast = NotificationService.progress("Dosya yükleniyor", progress);
    
    const interval = setInterval(() => {
      progress += 20;
      
      if (progress <= 100) {
        NotificationService.update(progressToast, {
          render: `📊 Dosya yükleniyor (${progress}%)`,
          progress: progress / 100
        });
      }
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          NotificationService.dismiss(progressToast);
          NotificationService.success("Dosya yükleme tamamlandı!");
        }, 500);
      }
    }, 800);
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg m-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">🔔 Notification System Demo</h2>
      <p className="text-gray-600 mb-6">
        Bu demo sayfası tüm bildirim türlerini test etmenizi sağlar. Butonlara tıklayarak farklı bildirim türlerini deneyebilirsiniz.
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <button
          onClick={testBasicNotifications}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          🎯 Temel Bildirimler
        </button>
        
        <button
          onClick={testAuthNotifications}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          🔐 Auth Bildirimleri
        </button>
        
        <button
          onClick={testBookNotifications}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          📚 Kitap Bildirimleri
        </button>
        
        <button
          onClick={testSocialNotifications}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          👥 Sosyal Bildirimler
        </button>
        
        <button
          onClick={testErrorNotifications}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          ❌ Hata Bildirimleri
        </button>
        
        <button
          onClick={testLoadingNotification}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          ⏳ Loading Bildirimi
        </button>
        
        <button
          onClick={testProgressNotification}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          📊 Progress Bildirimi
        </button>
        
        <button
          onClick={() => NotificationService.dismissAll()}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          🗑️ Tümünü Temizle
        </button>
      </div>

      <div className="mt-6 p-4 bg-white rounded-md border-l-4 border-blue-500">
        <h3 className="font-semibold text-gray-800 mb-2">💡 Kullanım Örnekleri:</h3>
        <code className="text-sm text-gray-600 block mb-2">
          NotificationService.success("Başarılı işlem!")
        </code>
        <code className="text-sm text-gray-600 block mb-2">
          NotificationService.auth.loginSuccess()
        </code>
        <code className="text-sm text-gray-600 block">
          NotificationService.book.addSuccess()
        </code>
      </div>
    </div>
  );
};

export default NotificationDemo; 