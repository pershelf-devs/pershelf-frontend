import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from "react-redux";
import { setAccessToken, setCurrentUser } from "../../redux/user/userSlice";
import NotificationService from "../../utils/notificationService";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [userInfo, setUserInfo] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Real-time validation
  const validateField = (fieldName, value) => {
    const newErrors = { ...errors };

    switch (fieldName) {
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
        } else if (value.length < 6) {
          newErrors.password = "Şifre en az 6 karakter olmalı";
        } else {
          delete newErrors.password;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }

    // Real-time validation
    validateField(name, value);
  };

  const getFieldStatus = (fieldName) => {
    const value = userInfo[fieldName];
    const hasError = errors[fieldName];
    const isEmpty = !value || !value.trim();
    
    if (isEmpty) return 'empty';
    if (hasError) return 'error';
    return 'valid';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submitting
    const newErrors = {};
    if (!userInfo.email.trim()) {
      newErrors.email = "E-posta gerekli";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email)) {
      newErrors.email = "Geçerli bir e-posta adresi girin";
    }

    if (!userInfo.password) {
      newErrors.password = "Şifre gerekli";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      NotificationService.validationError();
      return;
    }

    setIsLoading(true);

    // Loading toast
    const loadingToast = NotificationService.loading("Giriş yapılıyor...");

    try {
      const response = await axios.post("/api/auth/login", userInfo);
      const data = response.data;
      console.log("🧾 Full login response:", data);

      // Dismiss loading toast
      NotificationService.dismiss(loadingToast);

      if (data?.code === "3") {
        // Kullanıcı bulunamadı
        NotificationService.auth.loginError();
      } else if (data?.code === "11") {
        // Şifre yanlış
        NotificationService.auth.loginError();
      } else if (data?.status?.code === "0") {
        // Başarılı giriş
        const token = data?.data?.token;
        const userInfoData = data?.data?.userInfo;
        
        if (token && userInfoData) {
          setIsSuccess(true);
          dispatch(setAccessToken(token));
          dispatch(setCurrentUser(userInfoData));

          NotificationService.auth.loginSuccess();

          setTimeout(() => {
            navigate("/dashboard");
          }, 1500);
        } else {
          NotificationService.warning("Giriş başarılı ancak kullanıcı bilgileri eksik.");
        }
      } else {
        NotificationService.error(`Giriş başarısız. Beklenmeyen hata kodu: ${data?.code || data?.status?.code}`);
      }
    } catch (error) {
      // Dismiss loading toast
      NotificationService.dismiss(loadingToast);
      
      console.error("❌ Login catch error:", error.response?.data || error.message);
      
      // Network error handling
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        NotificationService.networkError();
      } else if (error.response?.status === 500) {
        NotificationService.serverError();
      } else if (error.response?.status === 429) {
        NotificationService.rateLimitError();
      } else {
        NotificationService.auth.loginError();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/images/registerlogin.png')" }}
    >
      {/* Login kutusu */}
      <div className="relative z-10 bg-white/10 backdrop-blur-md text-white rounded-xl shadow-xl p-8 w-full max-w-md mx-4">
        {/* Success State */}
        {isSuccess && (
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-green-400 mb-2">Giriş Başarılı!</h3>
            <p className="text-white/80">Dashboard'a yönlendiriliyorsunuz...</p>
          </div>
        )}

        {!isSuccess && (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center">{t("sign_in_to_pershelf_universe")}</h2>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    placeholder={t("email")}
                    value={userInfo.email}
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
              </div>

              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder={t("password")}
                    value={userInfo.password}
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
                    Giriş yapılıyor...
                  </>
                ) : (
                  <>
                    <span>🔐</span>
                    {t("login")}
                  </>
                )}
              </button>
            </form>

            <p className="text-sm mt-4 text-center">
              {t("dont_have_an_account")}
              <a href="/register" className="underline text-white/90 hover:text-white transition-colors ml-1">
                {t("register_here")}
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
