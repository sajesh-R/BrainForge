self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activated!');
    event.waitUntil(clients.claim());
});


self.addEventListener('push', function(event) {

    let data = {};
    
    if (event.data) {
        try {
            data = event.data.json();
            console.log('Push Event Received (JSON):', data);
        } catch (e) {
            console.error('Error parsing push data:', e);
            data = { title: 'LMS Update', body: event.data.text() };
            console.log('Push Event Received (Text):', data);
        }
    } else {
        console.log('Push Event Received (No Data)');
        data = { title: 'LMS Notification', body: 'You have a new update!' };
    }


    const options = {
        body: data.body || 'New update available',
        icon: data.icon || '/logo192.png',
        badge: '/badge.png',
        data: data.data || { url: '/' }
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'LMS Notification', options)
    );
});


self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    // Get the URL from the notification data, default to home
    const targetUrl = event.notification.data?.url || '/';
    
    // Resolve the full URL (works for localhost and production)
    const fullUrl = new URL(targetUrl, self.location.origin).href;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Check if there is already a window open with this URL
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === fullUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, open a new window
            if (clients.openWindow) {
                return clients.openWindow(fullUrl);
            }
        })
    );
});

