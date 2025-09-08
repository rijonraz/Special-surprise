
import { useState, useEffect } from 'react';
import type { CountdownState } from '../types';

const nextSep7 = (): Date => {
  const now = new Date();
  let year = now.getFullYear();
  const target = new Date(year, 8, 7, 0, 0, 0); // Month is 0-indexed, so 8 is September
  return now > target ? new Date(year + 1, 8, 7, 0, 0, 0) : target;
};

const pad = (num: number): string => String(num).padStart(2, '0');

export const useCountdown = (): CountdownState => {
  const [targetDate] = useState(nextSep7());
  const [countdown, setCountdown] = useState<CountdownState>({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
    isBirthday: false,
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;

      if (difference <= 0) {
        setCountdown({ days: '00', hours: '00', minutes: '00', seconds: '00', isBirthday: true });
        clearInterval(intervalId);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setCountdown({
        days: pad(days),
        hours: pad(hours),
        minutes: pad(minutes),
        seconds: pad(seconds),
        isBirthday: false,
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [targetDate]);

  return countdown;
};
