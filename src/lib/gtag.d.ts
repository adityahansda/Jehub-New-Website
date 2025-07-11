export const GA_TRACKING_ID = 'G-7ZWQNF3BVC';

// Pageview tracking
export const pageview = (url: string): void => {
    window.gtag('config', GA_TRACKING_ID, {
        page_path: url,
    });
};

// Event tracking
interface GTagEvent {
    action: string;
    category: string;
    label: string;
    value: number;
}

export const event = ({ action, category, label, value }: GTagEvent): void => {
    window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value,
    });
};
