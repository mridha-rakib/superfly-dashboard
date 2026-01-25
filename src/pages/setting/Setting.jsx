import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import avatar1 from "../../assets/images/avatar1.jpg";
import { userApi } from "../../services/userApi";
import { useAuthStore } from "../../state/authStore";

function Setting() {
  const authUser = useAuthStore((s) => s.user);
  const setUserInStore = useAuthStore((s) => s.setUser);
  const [user, setUser] = useState(() => ({
    name: authUser?.fullName || authUser?.name || "User",
    email: authUser?.email || "",
    phone: authUser?.phoneNumber || authUser?.phone || "",
    address: authUser?.address || "",
    avatar:
      authUser?.profileImage ||
      authUser?.profileImageUrl ||
      authUser?.avatar ||
      avatar1,
  }));

  const [isEditing, setIsEditing] = useState(false);
  const [tempUser, setTempUser] = useState({ ...user });
  const [avatarPreview, setAvatarPreview] = useState(user.avatar);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (authUser && authUser.email) {
        const merged = {
          name: authUser.fullName || authUser.name || "User",
          email: authUser.email || "",
          phone: authUser.phoneNumber || authUser.phone || "",
          address: authUser.address || "",
          avatar:
            authUser.profileImage ||
            authUser.profileImageUrl ||
            authUser.avatar ||
            avatar1,
        };
        setUser(merged);
        setTempUser(merged);
        setAvatarPreview(merged.avatar);
        return;
      }
      try {
        const profile = await userApi.getProfile();
        const merged = {
          name: profile.fullName || profile.name || "User",
          email: profile.email || "",
          phone: profile.phoneNumber || profile.phone || "",
          address: profile.address || "",
          avatar:
            profile.profileImage ||
            profile.profileImageUrl ||
            profile.avatar ||
            avatar1,
        };
        setUser(merged);
        setTempUser(merged);
        setAvatarPreview(merged.avatar);
        setUserInStore(profile);
      } catch (err) {
        toast.error(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load profile."
        );
      }
    };
    init();
  }, [authUser, setUserInStore]);

  const handleChange = (field, value) => {
    setTempUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
      try {
        setIsUploading(true);
        const updated = await userApi.uploadProfilePhoto(file);
        const profileImage =
          updated?.profileImage ||
          updated?.profileImageUrl ||
          updated?.avatar ||
          avatarPreview;
        const merged = {
          ...tempUser,
          avatar: profileImage,
        };
        setUser(merged);
        setTempUser(merged);
        setAvatarPreview(profileImage);
        setUserInStore({ ...(authUser || {}), ...updated, profileImage });
        toast.success("Profile photo updated");
      } catch (err) {
        toast.error(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to upload photo."
        );
      } finally {
        setIsUploading(false);
        e.target.value = "";
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        fullName: tempUser.name,
        phoneNumber: tempUser.phone,
        address: tempUser.address,
      };
      const updated = await userApi.updateProfile(payload);
      const merged = {
        name: updated.fullName || updated.name || tempUser.name,
        email: updated.email || tempUser.email,
        phone: updated.phoneNumber || tempUser.phone,
        address: updated.address || tempUser.address,
        avatar:
          updated.profileImage ||
          updated.profileImageUrl ||
          updated.avatar ||
          avatarPreview,
      };
      setUser(merged);
      setTempUser(merged);
      setAvatarPreview(merged.avatar);
      setUserInStore({ ...(authUser || {}), ...updated });
      setIsEditing(false);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update profile."
      );
    } finally {
      setIsSaving(false);
    }
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
              disabled={isSaving}
              className="rounded-lg bg-[#C85344] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Setting;
