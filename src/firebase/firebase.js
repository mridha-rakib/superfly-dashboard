// import { initializeApp } from 'firebase/app';
// import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// // Replace with your actual config from Firebase Console
// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "scbhs-85801.firebaseapp.com",
//   projectId: "scbhs-85801",
//   storageBucket: "scbhs-85801.appspot.com",
//   messagingSenderId: "YOUR_SENDER_ID",
//   appId: "YOUR_APP_ID"
// };

// const app = initializeApp(firebaseConfig);
// const messaging = getMessaging(app);

// // Request permission and get FCM token
// export const requestNotificationPermission = () => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const permission = await Notification.requestPermission();
//       if (permission === 'granted') {
//         const token = await getToken(messaging, {
//           vapidKey: 'BN7BQNkdgKb7vYO9Efy1UPZAuBibaXB05SzZvC4uGXHGh35xW7QgmKB2Yu_aM1j5oFnOlMjFSusUyDtVebOZ65Y'
//         });
//         console.log('FCM Token:', token);
//         resolve(token);
//       } else {
//         reject(new Error('Notification permission not granted'));
//       }
//     } catch (error) {
//       console.error('Error getting FCM token:', error);
//       reject(error);
//     }
//   });
// };

// // Listen for incoming messages
// export const onMessageListener = () =>
//   new Promise((resolve) => {
//     onMessage(messaging, (payload) => {
//       console.log('Message received:', payload);
//       resolve(payload);
//     });
//   });

// export { messaging };
