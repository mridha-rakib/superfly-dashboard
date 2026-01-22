// src/components/layout/Topbar/Topbar.jsx
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useRef, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import userdummy from "../../assets/images/user-dummy.png";
import { useAuthStore } from "../../state/authStore";
import {
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
} from "../../store/features/api/notificationApiSlice";

const Topbar = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notificationRef = useRef(null)

  // Handle click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationOpen]);

  // mutation
  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();

  const { user } = useAuthStore();
  const currentUser = {
    name: user?.fullName || user?.name || "User",
    role: user?.role === "super_admin" ? "Super Admin" : user?.role || "Admin",
    avatar: user?.profileImage || userdummy,
  };

  // Notification API response -- rakib
  const notifications = [
    {
      _id: 1,
      title: "Notification 1",
      body: "This is the body of notification 1",
      createdAt: "2023-01-01T00:00:00Z",
      isRead: false,
    },
    {
      _id: 2,
      title: "Notification 2",
      body: "This is the body of notification 2",
      createdAt: "2023-01-02T00:00:00Z",
      isRead: true,
    },
    {
      _id: 3,
      title: "Notification 3",
      body: "This is the body of notification 3",
      createdAt: "2023-01-03T00:00:00Z",
      isRead: false,
    },
  ]
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const isLoadingNotifications = false;

  const formatNotificationTime = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      console.log(error);
      return "Recently";
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification._id).unwrap();
        // Optionally navigate to related content using notification.relatedId
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  return (
    <div className="bg-white py-7 px-4 sm:px-6 relative ">
      <div className="flex items-center justify-end space-x-4 sm:space-x-6">
        {/* Notifications */}
        <div className="relative">
          <button
            className="p-1 sm:p-2 cursor-pointer rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
            onClick={() => {
              setIsNotificationOpen(!isNotificationOpen);
              setIsProfileOpen(false);
            }}
          >
            <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center h-3 w-3 sm:h-4 sm:w-4 text-[10px] sm:text-xs font-bold text-white bg-red-500 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotificationOpen && (
            <div
              ref={notificationRef}
              className="absolute right-0 mt-2 w-64 sm:w-80 bg-white rounded-md shadow-lg overflow-hidden z-10 border border-gray-200"
            >
              <div className="py-2 px-4 bg-gray-100 border-b flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-700">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-60 overflow-y-auto">
                {isLoadingNotifications ? (
                  <div className="py-4 px-4 text-center text-sm text-gray-500">
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-4 px-4 text-center text-sm text-gray-500">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        notification.isRead ? "bg-white" : "bg-blue-50"
                      }`}
                    >
                      <div className="py-3 px-4 flex items-start">
                        <div className="ml-2 sm:ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {notification.body}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatNotificationTime(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <span className="h-2 w-2 mt-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile dropdown */}
        <div className="relative">
          <button
            className="flex items-center space-x-2 focus:outline-none"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationOpen(false);
            }}
          >
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center text-white font-medium">
              <img
                src={userdummy}
                alt="User"
                className="rounded-full object-cover h-full w-full"
              />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900">
                {currentUser?.name || "User"}
              </p>
              <p className="text-xs text-gray-500">
                {currentUser?.role || "Admin"}
              </p>
            </div>
          </button>

          {/* {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{currentUser?.name || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{currentUser?.email || 'user@example.com'}</p>
              </div>
              <a onClick={() => navigate('/profile')} className="block px-4 py-2 text-sm cursor-pointer text-gray-700 hover:bg-gray-100">
                Profile
              </a>
              <div className="border-t border-gray-100"></div>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  // logout();
                  navigate('/login');
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
