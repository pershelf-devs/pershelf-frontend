import { toast } from "react-toastify";

// Notification Types
export const NotificationTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  LOADING: 'loading'
};

// Default toast options
const defaultOptions = {
  position: "top-right",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

class NotificationService {
  
  // Success notifications
  static success(message, options = {}) {
    return toast.success(`🎉 ${message}`, {
      ...defaultOptions,
      autoClose: 3000,
      ...options
    });
  }

  // Error notifications
  static error(message, options = {}) {
    return toast.error(`❌ ${message}`, {
      ...defaultOptions,
      autoClose: 5000,
      ...options
    });
  }

  // Warning notifications
  static warning(message, options = {}) {
    return toast.warn(`⚠️ ${message}`, {
      ...defaultOptions,
      autoClose: 4000,
      ...options
    });
  }

  // Info notifications
  static info(message, options = {}) {
    return toast.info(`ℹ️ ${message}`, {
      ...defaultOptions,
      ...options
    });
  }

  // Loading notifications
  static loading(message, options = {}) {
    return toast.loading(`🔄 ${message}`, {
      position: "top-right",
      ...options
    });
  }

  // Network error
  static networkError(options = {}) {
    return this.error("İnternet bağlantınızı kontrol edin ve tekrar deneyin.", {
      autoClose: 6000,
      ...options
    });
  }

  // Server error
  static serverError(options = {}) {
    return this.error("Sunucu hatası oluştu. Lütfen birkaç dakika sonra tekrar deneyin.", {
      autoClose: 6000,
      ...options
    });
  }

  // Rate limit error
  static rateLimitError(options = {}) {
    return this.error("Çok fazla deneme yapıldı. Lütfen birkaç dakika bekleyin.", {
      autoClose: 6000,
      ...options
    });
  }

  // Validation error
  static validationError(message = "Lütfen aşağıdaki hataları düzeltin", options = {}) {
    return this.error(message, {
      autoClose: 4000,
      ...options
    });
  }

  // Authentication notifications
  static auth = {
    loginSuccess: (options = {}) => this.success("Giriş başarılı! Yönlendiriliyorsunuz...", options),
    loginError: (options = {}) => this.error("E-posta adresi veya şifre hatalı.", options),
    registerSuccess: (options = {}) => this.success("Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...", options),
    registerError: (options = {}) => this.error("Kayıt işlemi başarısız oldu.", options),
    logoutSuccess: (options = {}) => this.success("Çıkış yapıldı.", options),
    sessionExpired: (options = {}) => this.warning("Oturum süreniz doldu. Lütfen tekrar giriş yapın.", options)
  };

  // Profile operations
  static profile = {
    updateSuccess: (options = {}) => this.success("Profil bilgileriniz güncellendi.", options),
    updateError: (options = {}) => this.error("Profil güncellenirken hata oluştu.", options),
    uploadSuccess: (options = {}) => this.success("Fotoğraf yüklendi.", options),
    uploadError: (options = {}) => this.error("Fotoğraf yüklenirken hata oluştu.", options)
  };

  // Book operations
  static book = {
    addSuccess: (options = {}) => this.success("Kitap listenize eklendi.", options),
    addError: (options = {}) => this.error("Kitap eklenirken hata oluştu.", options),
    removeSuccess: (options = {}) => this.success("Kitap listeden kaldırıldı.", options),
    removeError: (options = {}) => this.error("Kitap kaldırılırken hata oluştu.", options),
    reviewSuccess: (options = {}) => this.success("İncelemeniz paylaşıldı.", options),
    reviewError: (options = {}) => this.error("İnceleme paylaşılırken hata oluştu.", options)
  };

  // Social operations
  static social = {
    followSuccess: (username, options = {}) => this.success(`${username} takip edildi.`, options),
    followError: (options = {}) => this.error("Takip işlemi başarısız oldu.", options),
    unfollowSuccess: (username, options = {}) => this.success(`${username} takipten çıkarıldı.`, options),
    unfollowError: (options = {}) => this.error("Takipten çıkarma işlemi başarısız oldu.", options),
    likeSuccess: (options = {}) => this.info("Beğenildi.", { autoClose: 2000, ...options }),
    commentSuccess: (options = {}) => this.success("Yorumunuz paylaşıldı.", options),
    commentError: (options = {}) => this.error("Yorum paylaşılırken hata oluştu.", options)
  };

  // General operations
  static operation = {
    saveSuccess: (options = {}) => this.success("Değişiklikler kaydedildi.", options),
    saveError: (options = {}) => this.error("Kaydedilirken hata oluştu.", options),
    deleteSuccess: (options = {}) => this.success("Silme işlemi tamamlandı.", options),
    deleteError: (options = {}) => this.error("Silme işlemi başarısız oldu.", options),
    copySuccess: (options = {}) => this.success("Panoya kopyalandı.", { autoClose: 2000, ...options })
  };

  // Dismiss all toasts
  static dismissAll() {
    toast.dismiss();
  }

  // Dismiss specific toast
  static dismiss(toastId) {
    toast.dismiss(toastId);
  }

  // Update existing toast
  static update(toastId, options) {
    toast.update(toastId, options);
  }

  // Custom notification with icon
  static custom(message, icon, type = 'info', options = {}) {
    return toast[type](`${icon} ${message}`, {
      ...defaultOptions,
      ...options
    });
  }

  // Progress notification (for file uploads, etc.)
  static progress(message, progress, options = {}) {
    return toast.info(`📊 ${message} (${progress}%)`, {
      ...defaultOptions,
      autoClose: false,
      progress: progress / 100,
      ...options
    });
  }
}

export default NotificationService; 