import React from 'react';

export interface CountdownData {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Calculate countdown time until the target launch date
 * @param targetDate - The target date as a Date object or timestamp
 * @returns CountdownData object with days, hours, minutes, and seconds
 */
export const calculateCountdown = (targetDate: Date | number): CountdownData => {
  try {
    const now = new Date().getTime();
    const target = typeof targetDate === 'number' ? targetDate : targetDate.getTime();
    const difference = target - now;

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds };
    } else {
      // Return zeros if target date has passed
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
  } catch (error) {
    console.error('Countdown calculation error:', error);
    // Return zeros on error
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
};

/**
 * The official launch date for JEHUB
 * August 15, 2025 at 12:00 PM IST
 */
export const LAUNCH_DATE = new Date('2025-08-15T12:00:00+05:30');

/**
 * Custom React hook for countdown functionality
 * @returns CountdownData that updates every second
 */
export const useCountdown = (): CountdownData => {
  const [countdown, setCountdown] = React.useState<CountdownData>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  React.useEffect(() => {
    const updateCountdown = () => {
      setCountdown(calculateCountdown(LAUNCH_DATE));
    };

    updateCountdown(); // Call immediately
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, []);

  return countdown;
};
