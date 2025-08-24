// src/app/(main)/account/change-password/page.tsx
'use client';

import { changePasswordAction } from "@/app/actions/userActions";
import { useTransition, useRef } from "react";
import toast from "react-hot-toast";

export default function ChangePasswordPage() {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await changePasswordAction(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success!);
        formRef.current?.reset();
      }
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
      <h2 className="text-3xl font-medium text-brand-black mb-6">Change Password</h2>
      <form ref={formRef} action={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-brand-orange focus:border-brand-orange"
            required
            minLength={6}
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-brand-orange focus:border-brand-orange"
            required
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="bg-brand-orange text-white font-medium py-3 px-6 rounded-lg hover:bg-brand-orange-hover transition-colors disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
}