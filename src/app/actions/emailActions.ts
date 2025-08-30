// src/app/actions/emailActions.ts
'use server';

import { Resend } from 'resend';
import PurchaseConfirmationEmail from '@/components/emails/PurchaseConfirmationEmail';
import AdminSaleNotificationEmail from '@/components/emails/AdminSaleNotificationEmail';
import { Database } from '@/lib/database.types';
import ContactFormEmail from '@/components/emails/ContactFormEmail';

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
      from: 'Operatype.co <sales@operatype.co>',
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
            from: 'Operatype.co Sales <sales@operatype.co>',
            to: 'operatype.co@gmail.com',
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

export async function sendContactFormEmail(formData: FormData) {
  const name = String(formData.get('name'));
  const email = String(formData.get('email'));
  const subject = String(formData.get('subject'));
  const message = String(formData.get('message'));
  
  if (!name || !email || !subject || !message) {
    return { error: 'Please fill out all fields.' };
  }

  try {
    await resend.emails.send({
      from: 'Operatype.co Contact Form <contact@operatype.co>',
      to: 'operatype.co@gmail.com',
      // --- PERBAIKAN DI SINI ---
      replyTo: email, // Diubah dari reply_to menjadi replyTo (camelCase)
      // -------------------------
      subject: `New Contact Message: ${subject}`,
      react: ContactFormEmail({
        senderName: name,
        senderEmail: email,
        subject: subject,
        message: message,
      }),
    });
    return { success: 'Your message has been sent successfully!' };
  } catch (error) {
    console.error('Contact form email error:', error);
    return { error: 'Sorry, something went wrong. Please try again later.' };
  }
}