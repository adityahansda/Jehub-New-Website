// lib/gtag.ts

export const GA_TRACKING_ID = 'G-7ZWQNF3BVC';

// Dynamically load the GA script
export function loadGAScript(): void {
    if (typeof window === 'undefined') return; // only run on client

    // Avoid adding script multiple times
    if (document.getElementById('ga-script')) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    script.id = 'ga-script';

    document.head.appendChild(script);

    // Initialize gtag function after script load
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
        window.dataLayer.push(args);
    }
    (window as any).gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_TRACKING_ID, {
        page_path: window.location.pathname,
    });
}

// Pageview tracking helper
export const pageview = (url: string): void => {
    if (typeof window.gtag === 'function') {
        window.gtag('config', GA_TRACKING_ID, {
            page_path: url,
        });
    }
};
