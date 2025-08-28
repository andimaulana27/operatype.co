'use server';

import { Resend } from 'resend';
import PurchaseConfirmationEmail from '@/components/emails/PurchaseConfirmationEmail';
import AdminSaleNotificationEmail from '@/components/emails/AdminSaleNotificationEmail';
import { Database } from '@/lib/database.types';

const resend = new Resend(process.env.RESEND_API_KEY);

type OrderWithFont = Database['public']['Tables']['order_items']['Row'] & {
    fonts: { name: string | null } | null;
};
type UserDetails = { email: string; full_name: string | null; };
type TransactionDetails = { orderId: string; payerName: string; };

export async function sendPurchaseConfirmationEmail(
    userDetails: UserDetails, orders: OrderWithFont[],
    transactionDetails: TransactionDetails,
    downloadLinks: { name: string; url: string }[],
    invoicePdf: Buffer
) {
  try {
    await resend.emails.send({
      // ==================== PERBAIKAN PENGIRIM DI SINI ====================
      from: 'Operatype.co <sales@operatype.co>', // Kembalikan ke alamat di domain terverifikasi Anda
      // ====================================================================
      to: userDetails.email,
      subject: `Your Operatype.co Order Confirmation (#${transactionDetails.orderId})`,
      react: PurchaseConfirmationEmail({
        customerName: userDetails.full_name || transactionDetails.payerName,
        orderId: transactionDetails.orderId,
        orders: orders,
        downloadLinks: downloadLinks,
      }),
      attachments: [{
        filename: `invoice-${transactionDetails.orderId}.pdf`,
        content: invoicePdf,
      }],
    });
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { error: 'Failed to send confirmation email.' };
  }
}

export async function sendAdminSaleNotification(
    userDetails: UserDetails, orders: OrderWithFont[],
    transactionDetails: TransactionDetails
) {
    const totalAmount = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
    try {
        await resend.emails.send({
            // ==================== PERBAIKAN PENGIRIM & PENERIMA DI SINI ====================
            from: 'Operatype.co Sales <sales@operatype.co>', // Kembalikan ke alamat di domain terverifikasi Anda
            to: 'operatype.co@gmail.com', // Alamat penerima admin sudah benar
            // ===========================================================================
            subject: `🎉 New Sale! Order #${transactionDetails.orderId} for $${totalAmount.toFixed(2)}`,
            react: AdminSaleNotificationEmail({
                orderId: transactionDetails.orderId,
                totalAmount: totalAmount,
                customerName: userDetails.full_name || 'N/A',
                customerEmail: userDetails.email,
                items: orders.map(o => ({ name: o.fonts?.name || null, amount: o.amount }))
            })
        });
        return { success: true };
    } catch (error) {
        console.error('Admin notification error:', error);
        return { error: 'Failed to send admin notification.' };
    }
}