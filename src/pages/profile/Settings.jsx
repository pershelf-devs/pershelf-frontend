import React, { useState } from "react";

const SettingsPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="min-h-screen bg-[#2a1a0f] text-[#f8f8f2]">
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
            <div className="w-24 h-24 rounded-full bg-[#3b2316] flex items-center justify-center text-4xl">
              👤
            </div>
            <div>
              <input type="file" onChange={(e) => setAvatar(e.target.files?.[0] || null)} />
              <p className="text-sm mt-1 text-gray-300">Select a new avatar image</p>
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
