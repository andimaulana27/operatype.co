// src/app/actions/emailActions.ts
'use server';

import { Resend } from 'resend';
import PurchaseConfirmationEmail from '@/components/emails/PurchaseConfirmationEmail';
import { Database } from '@/lib/database.types';

const resend = new Resend(process.env.RESEND_API_KEY);

// Mendefinisikan tipe data yang lebih spesifik untuk email
type OrderWithFont = Database['public']['Tables']['orders']['Row'] & {
    fonts: { name: string | null } | null;
};

type UserDetails = {
  email: string;
  full_name: string | null;
};

type TransactionDetails = {
  orderId: string;
  payerName: string;
};

// Fungsi untuk mengirim email konfirmasi ke PEMBELI
export async function sendPurchaseConfirmationEmail(
    userDetails: UserDetails,
    orders: OrderWithFont[],
    transactionDetails: TransactionDetails
) {
  try {
    // Pastikan Anda mengganti 'noreply@yourdomain.com' dengan email dari domain yang sudah Anda verifikasi di Resend
    const { data, error } = await resend.emails.send({
      from: 'Operatype.co <noreply@operatype.co>', 
      to: userDetails.email,
      subject: `Your Operatype.co Order Confirmation (#${transactionDetails.orderId})`,
      react: PurchaseConfirmationEmail({
        customerName: userDetails.full_name || transactionDetails.payerName,
        orderId: transactionDetails.orderId,
        orders: orders,
      }),
    });

    if (error) {
        throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email sending error:', error);
    return { error: 'Failed to send confirmation email.' };
  }
}

// Fungsi untuk mengirim notifikasi penjualan ke ADMIN
export async function sendAdminSaleNotification(
    userDetails: UserDetails,
    orders: OrderWithFont[],
    transactionDetails: TransactionDetails
) {
    const totalAmount = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
    try {
        // Ganti 'admin@yourdomain.com' dengan alamat email Anda
        await resend.emails.send({
            from: 'Sales Alert <noreply@operatype.co>',
            to: 'admin@operatype.co', 
            subject: `🎉 New Sale! Order #${transactionDetails.orderId}`,
            html: `
                <h1>New Sale Notification</h1>
                <p><strong>Customer:</strong> ${userDetails.full_name} (${userDetails.email})</p>
                <p><strong>PayPal Order ID:</strong> ${transactionDetails.orderId}</p>
                <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
                <h2>Items Purchased:</h2>
                <ul>
                    ${orders.map(o => `<li>${o.fonts?.name || 'Unknown Font'} - $${o.amount?.toFixed(2)}</li>`).join('')}
                </ul>
            `
        });
        return { success: true };
    } catch (error) {
        console.error('Admin notification error:', error);
        return { error: 'Failed to send admin notification.' };
    }
}