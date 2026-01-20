import React, { useState } from "react";
import avatar1 from "../../assets/images/avatar1.jpg";
function Setting() {
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "123-456-7890",
    address: "123 Main St, City, Country",
    avatar: avatar1,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempUser, setTempUser] = useState({ ...user });
  const [avatarPreview, setAvatarPreview] = useState(user.avatar);

  const handleChange = (field, value) => {
    setTempUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
      setTempUser((prev) => ({ ...prev, avatar: file }));
    }
  };

  const handleSave = () => {
    setUser({ ...tempUser, avatar: avatarPreview });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempUser({ ...user });
    setAvatarPreview(user.avatar);
    setIsEditing(false);
  };

  return (
    <div className="">
      {/* Avatar + Name */}
      <div className="flex flex-col items-center mb-10">
        <div className="relative">
          <img
            src={avatarPreview}
            alt="Avatar"
            className="w-24 h-24 rounded-full mb-4 object-cover border border-gray-300"
          />
          {isEditing && (
            <label className="absolute bottom-0 right-0 bg-[#C85344] text-white p-1 rounded-full cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              ✎
            </label>
          )}
        </div>

        <h1 className="text-2xl font-bold mb-4">{isEditing ? tempUser.name : user.name}</h1>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-[#C85344] text-white px-5 py-2 rounded hover:bg-[#b84335] transition"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* User Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label className="mb-1 font-medium">Name</label>
          <input
            type="text"
            value={isEditing ? tempUser.name : user.name}
            disabled={!isEditing}
            onChange={(e) => handleChange("name", e.target.value)}
            className={`p-2 border rounded ${
              isEditing ? "border-gray-300" : "border-transparent bg-gray-100"
            }`}
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium">Email</label>
          <input
            type="email"
            value={user.email}
            disabled
            className="p-2 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium">Phone</label>
          <input
            type="tel"
            value={isEditing ? tempUser.phone : user.phone}
            disabled={!isEditing}
            onChange={(e) => handleChange("phone", e.target.value)}
            className={`p-2 border rounded ${
              isEditing ? "border-gray-300" : "border-transparent bg-gray-100"
            }`}
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium">Address</label>
          <input
            type="text"
            value={isEditing ? tempUser.address : user.address}
            disabled={!isEditing}
            onChange={(e) => handleChange("address", e.target.value)}
            className={`p-2 border rounded ${
              isEditing ? "border-gray-300" : "border-transparent bg-gray-100"
            }`}
          />
        </div>
      </div>

      {/* Save / Cancel Buttons at the Bottom */}
      {isEditing && (
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={handleSave}
            className="bg-[#C85344] text-white px-5 py-2 rounded hover:bg-[#b84335] transition"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="bg-gray-300 text-gray-700 px-5 py-2 rounded hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default Setting;
