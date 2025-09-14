// src/app/(admin)/admin/users/[id]/page.tsx
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
// import { DownloadIcon } from '@/components/icons'; // Dihapus
import ResetPasswordForm from '@/components/admin/ResetPasswordForm';
import { getUserDetails } from '@/app/actions/userActions'; // Import UserDetail dihapus

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  const { data: user, error } = await getUserDetails(params.id);

  if (error || !user) {
    console.error("Error fetching user details:", error);
    notFound();
  }
  
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const mainGridClass = user.role === 'admin' 
    ? "max-w-xl mx-auto"
    : "grid grid-cols-1 lg:grid-cols-3 gap-8";

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">User Details</h1>
          <div className="w-20 h-1 bg-brand-orange my-4"></div>
          <p className="text-gray-500 mt-1">Manage details and purchase history for this user.</p>
        </div>
      </div>

      <div className={mainGridClass}>
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-medium text-gray-900 border-b pb-3">User Information</h3>
                <div className="mt-4 space-y-2 text-sm">
                    <p><span className="font-semibold text-gray-600">Full Name:</span> {user.full_name}</p>
                    <p><span className="font-semibold text-gray-600">Email:</span> {user.email}</p>
                    <p><span className="font-semibold text-gray-600">Role:</span> <span className="font-mono bg-gray-100 px-2 py-1 rounded">{user.role}</span></p>
                    <p><span className="font-semibold text-gray-600">Registered:</span> {formatDate(user.created_at)}</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-medium text-gray-900 border-b pb-3">Admin Actions</h3>
                <div className="mt-4">
                    <ResetPasswordForm userId={user.id} />
                </div>
            </div>
        </div>
        
        {user.role !== 'admin' && (
            <div className="lg:col-span-2">
                <h3 className="text-xl font-medium text-gray-900 mb-4">Purchase History ({user.orders.length})</h3>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {user.orders.length > 0 ? user.orders.map(order => (
                                <tr key={order.id}>
                                    <td className="px-6 py-4">
                                        <Link href={`/fonts/${order.fonts?.slug || ''}`} className="flex items-center gap-3 group">
                                            <Image src={order.fonts?.main_image_url || '/placeholder.png'} alt={order.fonts?.name || ''} width={40} height={40} className="rounded-md" />
                                            <span className="font-medium text-gray-800 group-hover:text-brand-orange">{order.fonts?.name || 'Font not found'}</span>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 font-semibold">${order.amount?.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(order.created_at)}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={3} className="text-center py-8 text-gray-500">No purchase history.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}