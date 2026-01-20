import { createContext, useContext, useEffect, useState } from 'react';
// import { onMessageListener, requestNotificationPermission } from '../firebase/firebase';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  const [fcmToken, setFcmToken] = useState('');

  // Request permission and get FCM token on component mount
  useEffect(() => {
    const getToken = async () => {
      try {
        // const token = await requestNotificationPermission();
        // setFcmToken(token);
        // Send this token to your backend
        // console.log('FCM Token to send to backend:', token);
      } catch (error) {
        console.error('Error getting FCM token:', error);
      }
    };

    getToken();

    // Set up message listener
    const setupMessageListener = async () => {
      try {
        // const payload = await onMessageListener();
        // setNotification(payload);
        // You can show a toast notification here
      } catch (error) {
        console.error('Error in message listener:', error);
      }
    };

    setupMessageListener();
  }, []);

  return (
    <NotificationContext.Provider value={{ notification, fcmToken }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);