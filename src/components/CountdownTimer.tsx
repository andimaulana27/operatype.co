// src/components/CountdownTimer.tsx
'use client';

import { useState, useEffect } from 'react';

const COUNTDOWN_DURATION = 12 * 60 * 60 * 1000; // 12 jam dalam milidetik

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const getEndTime = () => {
      const storedEndTime = localStorage.getItem('countdownEndTime');
      const now = new Date().getTime();

      if (storedEndTime) {
        const endTime = parseInt(storedEndTime, 10);
        // Jika waktu tersimpan sudah lewat, buat timer baru.
        if (now >= endTime) {
          const newEndTime = now + COUNTDOWN_DURATION;
          localStorage.setItem('countdownEndTime', newEndTime.toString());
          return newEndTime;
        }
        // Jika waktu belum lewat, gunakan waktu yang tersimpan.
        return endTime;
      } else {
        // Jika tidak ada waktu tersimpan sama sekali, buat timer baru.
        const newEndTime = now + COUNTDOWN_DURATION;
        localStorage.setItem('countdownEndTime', newEndTime.toString());
        return newEndTime;
      }
    };

    const endTime = getEndTime();

    // Set nilai awal agar tidak 'Loading...' terlalu lama
    setTimeLeft(endTime - new Date().getTime());

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime - now;

      if (distance <= 0) {
        clearInterval(timer);
        // Panggil getEndTime lagi untuk memulai siklus baru saat komponen dirender ulang
        const newEndTime = getEndTime();
        setTimeLeft(newEndTime - now);
      } else {
        setTimeLeft(distance);
      }
    }, 1000);

    // Bersihkan interval saat komponen dilepas
    return () => clearInterval(timer);
  }, []); // Hapus dependensi agar useEffect hanya berjalan sekali saat komponen dimuat

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
      {timeLeft !== null ? formatTime(timeLeft) : '00 : 00 : 00'}
    </div>
  );
};

export default CountdownTimer;