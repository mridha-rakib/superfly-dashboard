import { useState } from "react";
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
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-gradient-to-r from-[#fff5f3] via-white to-[#fff7f5] p-6 shadow-sm">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left">
          <div className="relative">
            <img
              src={avatarPreview}
              alt="Avatar"
              className="h-24 w-24 rounded-full border-2 border-white object-cover shadow-sm"
            />
            {isEditing && (
              <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#C85344] text-white shadow-md transition hover:brightness-95">
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                ✎
              </label>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-gray-500">Profile</p>
            <h1 className="text-2xl font-bold text-gray-900">{isEditing ? tempUser.name : user.name}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <div className="flex flex-1 justify-end">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#C85344] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-[#C85344]">Account</p>
            <h2 className="text-lg font-semibold text-gray-900">Profile Details</h2>
          </div>
          {isEditing && (
            <span className="rounded-full bg-[#C85344]/10 px-3 py-1 text-xs font-semibold text-[#C85344]">
              Edit Mode
            </span>
          )}
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Name</label>
            <input
              type="text"
              value={isEditing ? tempUser.name : user.name}
              disabled={!isEditing}
              onChange={(e) => handleChange("name", e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm transition focus:ring-2 focus:ring-[#C85344]/20 ${
                isEditing ? "border-gray-300 bg-white" : "border-transparent bg-gray-100 text-gray-600"
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-600"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Phone</label>
            <input
              type="tel"
              value={isEditing ? tempUser.phone : user.phone}
              disabled={!isEditing}
              onChange={(e) => handleChange("phone", e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm transition focus:ring-2 focus:ring-[#C85344]/20 ${
                isEditing ? "border-gray-300 bg-white" : "border-transparent bg-gray-100 text-gray-600"
              }`}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Address</label>
            <input
              type="text"
              value={isEditing ? tempUser.address : user.address}
              disabled={!isEditing}
              onChange={(e) => handleChange("address", e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm transition focus:ring-2 focus:ring-[#C85344]/20 ${
                isEditing ? "border-gray-300 bg-white" : "border-transparent bg-gray-100 text-gray-600"
              }`}
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
            <button
              onClick={handleCancel}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-[#C85344] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Setting;
