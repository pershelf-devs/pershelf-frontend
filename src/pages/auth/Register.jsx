import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NotificationService from "../../utils/notificationService";

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form completion tracking
  const getFormCompletionPercentage = () => {
    const fields = ['name', 'surname', 'username', 'email', 'password', 'confirm_password'];
    const validFields = fields.filter(field => {
      const value = formData[field];
      const hasError = errors[field];
      const isEmpty = !value || !value.trim();
      
      // Field completion criteria: not empty AND no validation errors
      return !isEmpty && !hasError;
    });
    
    return Math.round((validFields.length / fields.length) * 100);
  };

  // Progress bar color based on completion
  const getProgressBarColor = () => {
    const percentage = getFormCompletionPercentage();
    if (percentage === 0) return 'bg-gray-400';
    if (percentage < 33) return 'bg-gradient-to-r from-red-400 to-red-500';
    if (percentage < 67) return 'bg-gradient-to-r from-yellow-400 to-orange-500';
    if (percentage < 100) return 'bg-gradient-to-r from-blue-400 to-blue-500';
    return 'bg-gradient-to-r from-green-400 to-green-500';
  };

  // Progress bar text based on completion
  const getProgressText = () => {
    const percentage = getFormCompletionPercentage();
    if (percentage === 0) return 'Başlamadınız';
    if (percentage < 33) return 'Başlangıç';
    if (percentage < 67) return 'Devam ediyor';
    if (percentage < 100) return 'Neredeyse bitti';
    return 'Tamamlandı';
  };

  const getFieldStatus = (fieldName) => {
    const value = formData[fieldName];
    const hasError = errors[fieldName];
    const isEmpty = !value || !value.trim();
    
    if (isEmpty) return 'empty';
    if (hasError) return 'error';
    return 'valid';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }

    // Real-time validation
    validateField(name, value);
  };

  // Real-time field validation
  const validateField = (fieldName, value) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = "İsim gerekli";
        } else if (value.trim().length < 3) {
          newErrors.name = "İsim en az 3 karakter olmalı";
        } else {
          delete newErrors.name;
        }
        break;

      case 'surname':
        if (!value.trim()) {
          newErrors.surname = "Soyisim gerekli";
        } else if (value.trim().length < 3) {
          newErrors.surname = "Soyisim en az 3 karakter olmalı";
        } else {
          delete newErrors.surname;
        }
        break;

      case 'username':
        if (!value.trim()) {
          newErrors.username = "Kullanıcı adı gerekli";
        } else if (value.trim().length < 5) {
          newErrors.username = "Kullanıcı adı en az 5 karakter olmalı";
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          newErrors.username = "Sadece harf, rakam ve alt çizgi kullanılabilir";
        } else {
          delete newErrors.username;
        }
        break;

      case 'email':
        if (!value.trim()) {
          newErrors.email = "E-posta gerekli";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "Geçerli bir e-posta adresi girin";
        } else {
          delete newErrors.email;
        }
        break;

      case 'password':
        if (!value) {
          newErrors.password = "Şifre gerekli";
        } else if (value.length < 8) {
          newErrors.password = "Şifre en az 8 karakter olmalı";
        } else if (!/(?=.*[a-z])/.test(value)) {
          newErrors.password = "En az bir küçük harf içermeli";
        } else if (!/(?=.*[A-Z])/.test(value)) {
          newErrors.password = "En az bir büyük harf içermeli";
        } else if (!/(?=.*\d)/.test(value)) {
          newErrors.password = "En az bir rakam içermeli";
        } else {
          delete newErrors.password;
        }
        break;

      case 'confirm_password':
        if (!value) {
          newErrors.confirm_password = "Şifre onayı gerekli";
        } else if (formData.password !== value) {
          newErrors.confirm_password = "Şifreler eşleşmiyor";
        } else {
          delete newErrors.confirm_password;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  // Validation functions
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters long";
    }

    // Surname validation
    if (!formData.surname.trim()) {
      newErrors.surname = "Surname is required";
    } else if (formData.surname.trim().length < 3) {
      newErrors.surname = "Surname must be at least 3 characters long";
    }

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.trim().length < 5) {
      newErrors.username = "Username must be at least 5 characters long";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const password = formData.password;
      if (password.length < 8) {
        newErrors.password = "Password must be at least 8 characters long";
      } else if (!/(?=.*[a-z])/.test(password)) {
        newErrors.password = "Password must contain at least one lowercase letter";
      } else if (!/(?=.*[A-Z])/.test(password)) {
        newErrors.password = "Password must contain at least one uppercase letter";
      } else if (!/(?=.*\d)/.test(password)) {
        newErrors.password = "Password must contain at least one number";
      }
    }

    // Confirm password validation
    if (!formData.confirm_password) {
      newErrors.confirm_password = "Please confirm your password";
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validate form before submitting
    if (!validateForm()) {
      NotificationService.validationError();
      return;
    }

    setIsLoading(true);

    // Loading toast
    const loadingToast = NotificationService.loading("Hesabınız oluşturuluyor...");

    try {
      const response = await axios.post("/api/auth/register", formData);

      // Dismiss loading toast
      NotificationService.dismiss(loadingToast);

      if (response?.data?.code === "0") {
        setIsSuccess(true);
        
        // Success notification
        NotificationService.auth.registerSuccess();

        // Clear form
        setFormData({
          name: "",
          surname: "",
          username: "",
          email: "",
          password: "",
          confirm_password: "",
        });

        setTimeout(() => {
          navigate("/login");
        }, 2000);
        
      } else {
        // Handle specific error cases
        const errorMessage = response?.data?.values?.length > 0 
          ? response.data.values.join(", ") 
          : "Kayıt işlemi başarısız";
          
        // Specific error handling
        if (errorMessage.toLowerCase().includes("username")) {
          NotificationService.error("Bu kullanıcı adı zaten kullanılıyor. Lütfen farklı bir kullanıcı adı seçin.");
        } else if (errorMessage.toLowerCase().includes("email")) {
          NotificationService.error("Bu e-posta adresi zaten kayıtlı. Lütfen farklı bir e-posta adresi kullanın.");
        } else if (errorMessage.toLowerCase().includes("password")) {
          NotificationService.error("Şifre gereksinimlerini karşılamıyor. Lütfen daha güçlü bir şifre seçin.");
        } else {
          NotificationService.auth.registerError();
        }
      }
      
    } catch (err) {
      // Dismiss loading toast
      NotificationService.dismiss(loadingToast);
      
      console.error("Registration error:", err);
      
      // Network error handling
      if (err.code === 'NETWORK_ERROR' || !err.response) {
        NotificationService.networkError();
      } else if (err.response?.status === 500) {
        NotificationService.serverError();
      } else if (err.response?.status === 429) {
        NotificationService.rateLimitError();
      } else {
        NotificationService.auth.registerError();
      }
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: "url('/images/registerlogin.png')" }}>
      <div className="relative z-10 bg-white/10 backdrop-blur-md text-white rounded-xl shadow-xl p-8 w-full max-w-md mx-4">
        {/* Success State */}
        {isSuccess && (
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-green-400 mb-2">Kayıt Başarılı!</h3>
            <p className="text-white/80">Giriş sayfasına yönlendiriliyorsunuz...</p>
          </div>
        )}

        {!isSuccess && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-center">{t("create_your_pershelf_account")}</h2>
            
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/70">Form Completion</span>
                <span className="text-sm text-white/70">{getProgressText()} ({getFormCompletionPercentage()}%)</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className={`${getProgressBarColor()} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${getFormCompletionPercentage()}%` }}
                ></div>
              </div>
            </div>

            <form className="flex flex-col gap-4" onSubmit={handleRegister}>
              <div>
                <div className="relative">
                  <input 
                    type="text" 
                    name="name" 
                    placeholder={t("name")} 
                    value={formData.name}
                    onChange={handleChange} 
                    disabled={isLoading}
                    className={`w-full bg-white/20 placeholder-white/70 text-white px-4 py-2 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 ${
                      errors.name ? 'border-2 border-red-500 focus:ring-red-300' : 
                      getFieldStatus('name') === 'valid' ? 'border-2 border-green-500' : ''
                    } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                  {/* Field Status Icon */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getFieldStatus('name') === 'valid' && <span className="text-green-400">✓</span>}
                    {getFieldStatus('name') === 'error' && <span className="text-red-400">✗</span>}
                  </div>
                </div>
                {errors.name && (
                  <div className="flex items-center mt-1">
                    <span className="text-red-400 text-xs">⚠️</span>
                    <p className="text-red-300 text-xs ml-1">{errors.name}</p>
                  </div>
                )}
                <p className="text-white/50 text-xs mt-1">Name must be at least 3 characters long</p>
              </div>

              <div>
                <div className="relative">
                  <input 
                    type="text" 
                    name="surname" 
                    placeholder={t("surname")} 
                    value={formData.surname}
                    onChange={handleChange} 
                    disabled={isLoading}
                    className={`w-full bg-white/20 placeholder-white/70 text-white px-4 py-2 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 ${
                      errors.surname ? 'border-2 border-red-500 focus:ring-red-300' : 
                      getFieldStatus('surname') === 'valid' ? 'border-2 border-green-500' : ''
                    } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                  {/* Field Status Icon */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getFieldStatus('surname') === 'valid' && <span className="text-green-400">✓</span>}
                    {getFieldStatus('surname') === 'error' && <span className="text-red-400">✗</span>}
                  </div>
                </div>
                {errors.surname && (
                  <div className="flex items-center mt-1">
                    <span className="text-red-400 text-xs">⚠️</span>
                    <p className="text-red-300 text-xs ml-1">{errors.surname}</p>
                  </div>
                )}
                <p className="text-white/50 text-xs mt-1">Surname is required</p>
              </div>

              <div>
                <div className="relative">
                  <input 
                    type="text" 
                    name="username" 
                    placeholder={t("username")} 
                    value={formData.username}
                    onChange={handleChange} 
                    disabled={isLoading}
                    className={`w-full bg-white/20 placeholder-white/70 text-white px-4 py-2 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 ${
                      errors.username ? 'border-2 border-red-500 focus:ring-red-300' : 
                      getFieldStatus('username') === 'valid' ? 'border-2 border-green-500' : ''
                    } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                  {/* Field Status Icon */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getFieldStatus('username') === 'valid' && <span className="text-green-400">✓</span>}
                    {getFieldStatus('username') === 'error' && <span className="text-red-400">✗</span>}
                  </div>
                </div>
                {errors.username && (
                  <div className="flex items-center mt-1">
                    <span className="text-red-400 text-xs">⚠️</span>
                    <p className="text-red-300 text-xs ml-1">{errors.username}</p>
                  </div>
                )}
                <p className="text-white/50 text-xs mt-1">Username is required</p>
              </div>

              <div>
                <div className="relative">
                  <input 
                    type="email" 
                    name="email" 
                    placeholder={t("email")} 
                    value={formData.email}
                    onChange={handleChange} 
                    disabled={isLoading}
                    className={`w-full bg-white/20 placeholder-white/70 text-white px-4 py-2 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 ${
                      errors.email ? 'border-2 border-red-500 focus:ring-red-300' : 
                      getFieldStatus('email') === 'valid' ? 'border-2 border-green-500' : ''
                    } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                  {/* Field Status Icon */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getFieldStatus('email') === 'valid' && <span className="text-green-400">✓</span>}
                    {getFieldStatus('email') === 'error' && <span className="text-red-400">✗</span>}
                  </div>
                </div>
                {errors.email && (
                  <div className="flex items-center mt-1">
                    <span className="text-red-400 text-xs">⚠️</span>
                    <p className="text-red-300 text-xs ml-1">{errors.email}</p>
                  </div>
                )}
                <p className="text-white/50 text-xs mt-1">Email is required</p>
              </div>

              <div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="password" 
                    placeholder={t("password")} 
                    value={formData.password}
                    onChange={handleChange} 
                    disabled={isLoading}
                    className={`w-full bg-white/20 placeholder-white/70 text-white px-4 py-2 pr-20 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 ${
                      errors.password ? 'border-2 border-red-500 focus:ring-red-300' : 
                      getFieldStatus('password') === 'valid' ? 'border-2 border-green-500' : ''
                    } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                  {/* Field Status Icon */}
                  <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                    {getFieldStatus('password') === 'valid' && <span className="text-green-400">✓</span>}
                    {getFieldStatus('password') === 'error' && <span className="text-red-400">✗</span>}
                  </div>
                  {/* Show/Hide Password Icon */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <div className="flex items-center mt-1">
                    <span className="text-red-400 text-xs">⚠️</span>
                    <p className="text-red-300 text-xs ml-1">{errors.password}</p>
                  </div>
                )}
                <p className="text-white/60 text-xs mt-1">{t("password_requirements")}</p>
                <p className="text-white/50 text-xs">Must be 8+ chars with uppercase, lowercase & number</p>
              </div>

              <div>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirm_password" 
                    placeholder={t("confirm_password")} 
                    value={formData.confirm_password}
                    onChange={handleChange} 
                    disabled={isLoading}
                    className={`w-full bg-white/20 placeholder-white/70 text-white px-4 py-2 pr-20 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 ${
                      errors.confirm_password ? 'border-2 border-red-500 focus:ring-red-300' : 
                      getFieldStatus('confirm_password') === 'valid' ? 'border-2 border-green-500' : ''
                    } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                  {/* Field Status Icon */}
                  <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                    {getFieldStatus('confirm_password') === 'valid' && <span className="text-green-400">✓</span>}
                    {getFieldStatus('confirm_password') === 'error' && <span className="text-red-400">✗</span>}
                  </div>
                  {/* Show/Hide Password Icon */}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirm_password && (
                  <div className="flex items-center mt-1">
                    <span className="text-red-400 text-xs">⚠️</span>
                    <p className="text-red-300 text-xs ml-1">{errors.confirm_password}</p>
                  </div>
                )}
                <p className="text-white/60 text-xs mt-1">{t("confirm_password_help")}</p>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className={`w-full py-3 rounded-md font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  isLoading 
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                    : 'bg-white text-black hover:bg-gray-200 hover:scale-105 transform'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-700 border-t-transparent"></div>
                    Registering...
                  </>
                ) : (
                  <>
                    <span>📝</span>
                    {t("register")}
                  </>
                )}
              </button>
            </form>

            <p className="text-sm mt-4 text-center">
              {t("already_have_an_account")}
              <a href="/login" className="underline text-white/90 hover:text-white transition-colors ml-1">
                {t("login_here")}
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;