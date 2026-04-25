import { useEffect, useState } from "react";
import { toast } from "@/lib/notify";
import avatar1 from "../../assets/images/avatar1.jpg";
import { authApi } from "../../services/authApi";
import { legalContentApi } from "../../services/legalContentApi";
import { userApi } from "../../services/userApi";
import { useAuthStore } from "../../state/authStore";

const LEGAL_PAGE_CONFIG = [
  {
    slug: "privacy-policy",
    label: "Privacy Policy",
    helper:
      "Shown on the public website at /privacy-policy. Use plain text with spacing between sections.",
  },
  {
    slug: "terms-and-conditions",
    label: "Terms and Conditions",
    helper:
      "Shown on the public website at /terms-and-conditions. Changes are visible on the frontend immediately.",
  },
];

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
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [legalPages, setLegalPages] = useState(() =>
    LEGAL_PAGE_CONFIG.reduce((acc, page) => {
      acc[page.slug] = {
        title: page.label,
        content: "",
      };
      return acc;
    }, {})
  );
  const [isLoadingLegalPages, setIsLoadingLegalPages] = useState(true);
  const [savingLegalSlug, setSavingLegalSlug] = useState("");

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

  useEffect(() => {
    let active = true;

    const loadLegalPages = async () => {
      setIsLoadingLegalPages(true);
      try {
        const entries = await Promise.all(
          LEGAL_PAGE_CONFIG.map(async (page) => {
            const response = await legalContentApi.getBySlug(page.slug);
            return [page.slug, response];
          })
        );

        if (!active) return;

        setLegalPages((prev) =>
          entries.reduce(
            (acc, [slug, response]) => ({
              ...acc,
              [slug]: {
                title: response?.title || prev[slug]?.title || "",
                content: response?.content || prev[slug]?.content || "",
              },
            }),
            { ...prev }
          )
        );
      } catch (err) {
        if (!active) return;
        toast.error(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load legal pages."
        );
      } finally {
        if (active) {
          setIsLoadingLegalPages(false);
        }
      }
    };

    loadLegalPages();

    return () => {
      active = false;
    };
  }, []);

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

  const handlePasswordFieldChange = (field, value) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    setPasswordError("");
    setPasswordSuccess("");
  };

  const handleLegalFieldChange = (slug, field, value) => {
    setLegalPages((prev) => ({
      ...prev,
      [slug]: {
        ...prev[slug],
        [field]: value,
      },
    }));
  };

  const handleSaveLegalPage = async (slug) => {
    const page = legalPages[slug];
    if (!page?.title?.trim() || !page?.content?.trim()) {
      toast.error("Title and content are required.");
      return;
    }

    setSavingLegalSlug(slug);
    try {
      const updated = await legalContentApi.updateBySlug(slug, {
        title: page.title.trim(),
        content: page.content.trim(),
      });

      setLegalPages((prev) => ({
        ...prev,
        [slug]: {
          title: updated?.title || page.title.trim(),
          content: updated?.content || page.content.trim(),
        },
      }));
      toast.success("Legal page updated.");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update legal page."
      );
    } finally {
      setSavingLegalSlug("");
    }
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from current password.");
      return;
    }

    setIsChangingPassword(true);
    setPasswordError("");
    setPasswordSuccess("");
    try {
      const res = await authApi.changePassword({ currentPassword, newPassword });
      const message =
        res?.message ||
        "Password changed successfully. Please login again with your new password.";
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordSuccess(message);
      toast.success("Password changed successfully.");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to change password.";
      setPasswordError(message);
      toast.error(message);
    } finally {
      setIsChangingPassword(false);
    }
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
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={isUploading}
                />
                {isUploading ? "..." : "✎"}
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
            <label className="text-sm font-semibold text-gray-700">Full Name</label>
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

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <p className="text-xs uppercase tracking-wide text-[#C85344]">Security</p>
          <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-semibold text-gray-700">Current Password</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => handlePasswordFieldChange("currentPassword", e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition focus:ring-2 focus:ring-[#C85344]/20"
              autoComplete="current-password"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">New Password</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => handlePasswordFieldChange("newPassword", e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition focus:ring-2 focus:ring-[#C85344]/20"
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Confirm New Password</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => handlePasswordFieldChange("confirmPassword", e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition focus:ring-2 focus:ring-[#C85344]/20"
              autoComplete="new-password"
            />
          </div>
        </div>

        {(passwordError || passwordSuccess) && (
          <div className="px-6 pb-4">
            <p
              className={`rounded-lg px-3 py-2 text-sm ${
                passwordError
                  ? "border border-red-200 bg-red-50 text-red-700"
                  : "border border-green-200 bg-green-50 text-green-700"
              }`}
            >
              {passwordError || passwordSuccess}
            </p>
          </div>
        )}

        <div className="flex justify-end border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={handleChangePassword}
            disabled={isChangingPassword}
            className="rounded-lg bg-[#C85344] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 disabled:opacity-60"
          >
            {isChangingPassword ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <p className="text-xs uppercase tracking-wide text-[#C85344]">Website</p>
          <h2 className="text-lg font-semibold text-gray-900">Legal Pages</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage the public Privacy Policy and Terms and Conditions pages from
            here.
          </p>
        </div>

        <div className="space-y-6 p-6">
          {LEGAL_PAGE_CONFIG.map((page) => {
            const current = legalPages[page.slug] || { title: "", content: "" };
            const isSavingLegalPage = savingLegalSlug === page.slug;

            return (
              <section
                key={page.slug}
                className="rounded-2xl border border-gray-200 bg-[#fcfcfc] p-5"
              >
                <div className="flex flex-col gap-2 border-b border-gray-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {page.label}
                    </h3>
                    <p className="text-sm text-gray-500">{page.helper}</p>
                  </div>
                  <span className="rounded-full bg-[#C85344]/10 px-3 py-1 text-xs font-semibold text-[#C85344]">
                    {page.slug}
                  </span>
                </div>

                {isLoadingLegalPages ? (
                  <div className="space-y-3 py-5">
                    <div className="h-10 w-full rounded-lg bg-gray-100" />
                    <div className="h-48 w-full rounded-2xl bg-gray-100" />
                  </div>
                ) : (
                  <div className="space-y-4 pt-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Page Title
                      </label>
                      <input
                        type="text"
                        value={current.title}
                        onChange={(e) =>
                          handleLegalFieldChange(page.slug, "title", e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition focus:ring-2 focus:ring-[#C85344]/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Content
                      </label>
                      <textarea
                        rows={14}
                        value={current.content}
                        onChange={(e) =>
                          handleLegalFieldChange(page.slug, "content", e.target.value)
                        }
                        className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm leading-6 transition focus:ring-2 focus:ring-[#C85344]/20"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleSaveLegalPage(page.slug)}
                        disabled={isSavingLegalPage}
                        className="rounded-lg bg-[#C85344] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 disabled:opacity-60"
                      >
                        {isSavingLegalPage ? "Saving..." : "Save Page"}
                      </button>
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Setting;

