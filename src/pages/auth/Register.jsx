import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("/api/auth/register", formData);


      if (response?.data?.code === "0") {
        alert("Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.");
        navigate("/login");
      } else {
        alert("Kayıt başarısız: " + JSON.stringify(response?.data?.values || ""));
      }
    } catch (err) {
      console.error(err);
      alert("Bir hata oluştu. Kayıt başarısız.");
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: "url('/images/registerlogin.png')" }}>
      <div className="relative z-10 bg-white/10 backdrop-blur-md text-white rounded-xl shadow-xl p-8 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Create your Pershelf account</h2>

        <form className="flex flex-col gap-4" onSubmit={handleRegister}>
          <input type="text" name="name" placeholder="Name" onChange={handleChange} required className="bg-white/20 placeholder-white/70 text-white px-4 py-2 rounded-md focus:outline-none" />
          <input type="text" name="surname" placeholder="Surname" onChange={handleChange} required className="bg-white/20 placeholder-white/70 text-white px-4 py-2 rounded-md focus:outline-none" />
          <input type="text" name="username" placeholder="Username" onChange={handleChange} required className="bg-white/20 placeholder-white/70 text-white px-4 py-2 rounded-md focus:outline-none" />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required className="bg-white/20 placeholder-white/70 text-white px-4 py-2 rounded-md focus:outline-none" />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required className="bg-white/20 placeholder-white/70 text-white px-4 py-2 rounded-md focus:outline-none" />
          <input type="password" name="confirm_password" placeholder="Confirm Password" onChange={handleChange} required className="bg-white/20 placeholder-white/70 text-white px-4 py-2 rounded-md focus:outline-none" />

          <button type="submit" className="bg-white text-black font-semibold py-2 rounded-md hover:bg-gray-200 transition">
            Register
          </button>
        </form>

        <p className="text-sm mt-4 text-center">
          Already have an account?{" "}
          <a href="/login" className="underline text-white/90 hover:text-white">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;