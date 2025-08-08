// src/components/ToastNotification.tsx
'use client';

type ToastProps = {
  message: string;
  isVisible: boolean;
};

const ToastNotification = ({ message, isVisible }: ToastProps) => {
  return (
    <div
      className={`fixed bottom-5 right-5 bg-brand-black text-white px-6 py-3 rounded-lg shadow-lg transition-opacity duration-300
        ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
    >
      {message}
    </div>
  );
};

export default ToastNotification;
