// src/app/(admin)/admin/users/page.tsx
'use client';

import { useState, useEffect, useTransition } from 'react';
import { getUsersWithDetails, UserWithProfile } from '@/app/actions/userActions';
import { Search, UserCircle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import AdminPagination from '@/components/admin/AdminPagination'; // Gunakan komponen pagination yang konsisten
import { useDebouncedCallback } from 'use-debounce'; // Untuk pencarian yang lebih smooth

const ITEMS_PER_PAGE = 15;

const RoleBadge = ({ role }: { role: string | null }) => {
  const isAdmin = role === 'admin';
  const badgeClasses = isAdmin ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700';
  const Icon = isAdmin ? ShieldCheck : UserCircle;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold leading-5 rounded-full ${badgeClasses}`}>
      <Icon className="w-4 h-4" />
      {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User'}
    </span>
  );
};

export default function ManageUsersPage() {
  const [profiles, setProfiles] = useState<UserWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isPending, startTransition] = useTransition();

  // Gunakan useEffect untuk memanggil data dari server action
  useEffect(() => {
    const fetchUsers = () => {
        startTransition(async () => {
            const { data, count, error } = await getUsersWithDetails(currentPage, ITEMS_PER_PAGE, searchTerm);
            if (error) {
                toast.error('Failed to fetch users: ' + error);
            } else {
                setProfiles(data as UserWithProfile[]);
                setTotalUsers(count || 0);
            }
            if (isLoading) setIsLoading(false);
        });
    };
    fetchUsers();
  }, [currentPage, searchTerm]);

  // Gunakan debounce untuk input pencarian agar tidak memanggil server di setiap ketikan
  const debouncedSearch = useDebouncedCallback((term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  }, 300);

  const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manage Users</h1>
          <div className="w-20 h-1 bg-brand-orange my-4"></div>
          <p className="text-gray-500 mt-1">View and manage all registered users.</p>
        </div>
      </div>
      <div className="mb-4 relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            onChange={(e) => debouncedSearch(e.target.value)} 
            className="w-full md:w-1/3 pl-10 pr-4 py-2 border rounded-lg" 
          />
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Registered</th>
              <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading || isPending ? (
              <tr><td colSpan={4} className="text-center py-8">Loading users...</td></tr>
            ) : profiles.length > 0 ? profiles.map((profile) => (
              <tr key={profile.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{profile.full_name || 'No name provided'}</div>
                  <div className="text-sm text-gray-500">{profile.email}</div>
                </td>
                <td className="px-6 py-4"><RoleBadge role={profile.role} /></td>
                <td className="px-6 py-4 text-sm text-gray-500">{formatDate(profile.created_at)}</td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <Link href={`/admin/users/${profile.id}`} className="text-indigo-600 hover:text-indigo-900">View Details</Link>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="text-center py-8 text-gray-500">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {!isLoading && totalPages > 1 && (
        <AdminPagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={(page: number) => setCurrentPage(page)} 
        />
      )}
    </div>
  );
}