import React, { useEffect, useState } from 'react';

const NotificationsSetup: React.FC = () => {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [permission, setPermission] = useState(Notification.permission);

  useEffect(() => {
    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);

        const sub = await registration.pushManager.getSubscription();
        setSubscription(sub);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    if ('serviceWorker' in navigator && 'PushManager' in window) {
      registerServiceWorker();
    } else {
      console.warn('Push messaging is not supported');
    }
  }, []);

  const requestPushPermission = () => {
    Notification.requestPermission().then((permission) => {
      setPermission(permission);
      if (permission === 'granted') {
        subscribeUserToPush();
      }
    });
  };

  const subscribeUserToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: '<YOUR_PUBLIC_VAPID_KEY>'
      });

      console.log('User is subscribed:', subscription);
      setSubscription(subscription);
      // Send subscription to the server to save
    } catch (error) {
      console.error('Failed to subscribe user:', error);
    }
  };

  return (
    <div>
      <h3>Enable Notifications</h3>
      <p>Permission status: {permission}</p>
      {permission !== 'granted' && (
        <button onClick={requestPushPermission}>Allow Notifications</button>
      )}
    </div>
  );
};

export default NotificationsSetup;
