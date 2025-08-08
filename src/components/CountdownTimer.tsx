// src/components/CountdownTimer.tsx
'use client';

import { useState, useEffect } from 'react';

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const getEndTime = (): number => {
      const storedEndTime = localStorage.getItem('countdownEndTime');
      if (storedEndTime) {
        const endTime = parseInt(storedEndTime, 10);
        const now = new Date().getTime();

        // Cek jika waktu sudah habis
        if (now > endTime) {
          const cooldownEnd = endTime + (60 * 60 * 1000); // 1 jam cooldown
          // Jika cooldown juga sudah habis, mulai timer baru
          if (now > cooldownEnd) {
            const newEndTime = now + (12 * 60 * 60 * 1000); // 12 jam dari sekarang
            localStorage.setItem('countdownEndTime', newEndTime.toString());
            return newEndTime;
          }
          // Jika masih dalam masa cooldown, jangan mulai timer baru
          return 0;
        }
        // Jika waktu belum habis, lanjutkan
        return endTime;
      } else {
        // Jika tidak ada timer sama sekali, mulai yang baru
        const newEndTime = new Date().getTime() + (12 * 60 * 60 * 1000); // 12 jam
        localStorage.setItem('countdownEndTime', newEndTime.toString());
        return newEndTime;
      }
    };

    const endTime = getEndTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime > 0 ? endTime - now : 0;

      if (distance <= 0) {
        setTimeLeft(0);
        // Cek lagi untuk memulai ulang setelah cooldown
        getEndTime(); 
      } else {
        setTimeLeft(distance);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]); // Bergantung pada timeLeft untuk memicu pengecekan ulang

  const formatTime = (milliseconds: number) => {
    if (milliseconds <= 0) return '00 : 00 : 00';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${h} : ${m} : ${s}`;
  };

  return (
    <div className="text-3xl font-medium text-brand-orange tracking-wider mt-4">
      {timeLeft !== null ? formatTime(timeLeft) : 'Loading...'}
    </div>
  );
};

export default CountdownTimer;
