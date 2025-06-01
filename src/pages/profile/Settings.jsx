import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { api } from "../../api/api";

const SettingsPage = () => {
  const { currentUser } = useSelector((state) => state.user);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [avatar, setAvatar] = useState(null); // Dosya seçimi için
  const [avatarPreview, setAvatarPreview] = useState(""); // Görsel için
  const [selectedImage, setSelectedImage] = useState(null); // Base64 string
  const [isSaving, setIsSaving] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.full_name || currentUser.name || "");
      setEmail(currentUser.email || "");
      setGender(currentUser.gender || "");
      setAvatarPreview(currentUser.avatar_base64 || currentUser.avatar_url || "");
    }
  }, [currentUser]);

  // Dosya seçilince önizleme göster ve base64'e çevir
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Resim boyutu 5MB'dan küçük olmalıdır.");
        return;
      }
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Profil fotoğrafını kaydet
  const handleSaveImage = async () => {
    if (!selectedImage) return;
    setIsSaving(true);
    try {
      const img = new window.Image();
      img.src = selectedImage;
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 500;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.8);

        await api.post("/users/update/profile-photo", {
          user_id: currentUser?.id,
          image_base64: optimizedBase64
        });
        setAvatarPreview(optimizedBase64);
        setSelectedImage(null);
        setAvatar(null);
      };
    } catch (error) {
      alert("Resim yüklenirken bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  // Profil fotoğrafını kaldır
  const handleRemoveImage = async () => {
    try {
      await api.post("/users/remove/image", {
        userId: currentUser?.id
      });
      setAvatarPreview("");
      setSelectedImage(null);
      setAvatar(null);
    } catch (error) {
      alert("Resim kaldırılırken bir hata oluştu.");
    }
  };

  return (
    <div className="min-h-screen bg-[#2a1a0f] text-[#f8f8f2] pt-16 bg-cover bg-center"
      style={{ backgroundImage: "url('/images/profile-settings-bg.png')" }}>
      <div className="max-w-4xl mx-auto p-6 space-y-12">

        {/* Account Settings */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Account Settings</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2 rounded bg-[#3b2316] text-white"
            />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded bg-[#3b2316] text-white"
            />
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-2 rounded bg-[#3b2316] text-white"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <button className="bg-[#a65b38] hover:bg-[#c08457] text-white px-4 py-2 rounded">
              Save Changes
            </button>
          </div>
        </section>

        {/* Profile Picture */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Profile Picture</h2>
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-full bg-[#3b2316] flex items-center justify-center text-4xl overflow-hidden border-2 border-[#a65b38] group">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>👤</span>
              )}
              {/* Kaldır butonu */}
              {avatarPreview && !selectedImage && (
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-1 right-1 bg-red-500 p-1 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  title="Fotoğrafı Kaldır"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
              />
              <p className="text-sm mt-1 text-gray-300">Select a new avatar image</p>
              {/* Kaydet ve İptal butonları */}
              {selectedImage && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSaveImage}
                    disabled={isSaving}
                    className={`px-3 py-1 text-sm rounded-lg flex items-center gap-1 ${
                      isSaving
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-[#a65b38] hover:bg-[#8a4d32]'
                    } transition-colors`}
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Kaydet
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setAvatarPreview(currentUser.avatar_base64 || currentUser.avatar_url || "");
                      setAvatar(null);
                    }}
                    className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    İptal
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Change Password */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Change Password</h2>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 rounded bg-[#3b2316] text-white"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 rounded bg-[#3b2316] text-white"
            />
            <button className="bg-[#a65b38] hover:bg-[#c08457] text-white px-4 py-2 rounded">
              Change Password
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
