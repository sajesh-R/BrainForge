const VAPID_PUBLIC_KEY = 'BGnThTaQK0EXleQqI84qRV-K5xtB1VVugF_MDaXQ4g35XCWhZrsxFeXW5c35rdPgn2t4B6iyYFOg3EmOEAXyI_s';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export const subscribeToPush = async (apiClient) => {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered');

            // Check Permission Status
            if (Notification.permission === 'denied') {
                console.warn('CRITICAL: Chrome is blocking notifications for this site! Please enable them in your browser settings.');
                alert('Warning: Your browser is blocking notifications. Please click the icon next to the URL and select "Allow Notifications".');
                return;
            }

            if (Notification.permission === 'default') {
                await Notification.requestPermission();
            }


            let subscription = await registration.pushManager.getSubscription();

            if (!subscription) {
                const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidKey
                });
                console.log('User subscribed to Push');
                
                // Send subscription to backend
                await apiClient.post('/notifications/subscribe', subscription);
                console.log('Subscription sent to backend');
            }


        } catch (error) {
            console.error('Push Subscription Error:', error);
        }
    }
};
