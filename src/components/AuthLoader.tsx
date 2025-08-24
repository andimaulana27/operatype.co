// src/components/AuthLoader.tsx
'use client';

const AuthLoader = ({ message }: { message: string }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-brand-orange"></div>
      <p className="text-white text-xl mt-4">{message}</p>
    </div>
  );
};

export default AuthLoader;