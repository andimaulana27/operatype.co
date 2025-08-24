// src/app/(main)/account/edit-profile/page.tsx
'use client';

import { useAuth } from "@/context/AuthContext";
import { updateProfileAction } from "@/app/actions/userActions";
import { useTransition, useRef } from "react";
import toast from "react-hot-toast";

export default function EditProfilePage() {
  const { profile } = useAuth();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateProfileAction(formData);
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
      <h2 className="text-3xl font-medium text-brand-black mb-6">Edit Profile</h2>
      <form ref={formRef} action={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            defaultValue={profile?.full_name || ''}
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
                {isPending ? 'Saving...' : 'Save Changes'}
            </button>
        </div>
      </form>
    </div>
  );
}