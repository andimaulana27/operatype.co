// src/components/PayPalButtons.tsx
'use client';

import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useCart } from '@/context/CartContext';
import { createOrderAction } from '@/app/actions/orderActions';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useTransition } from 'react';

const PayPalWrapper = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const payPalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (!payPalClientId) {
    return <div className="text-center text-red-500">PayPal Client ID not found.</div>;
  }

  const initialOptions = {
    clientId: payPalClientId,
    currency: "USD",
    intent: "capture",
  };

  // --- PERBAIKAN: Tangkap detail pembayaran dari PayPal ---
  const handleApprove = async (data: any, actions: any) => {
    try {
      const details = await actions.order.capture();
      
      startTransition(async () => {
        toast.loading('Processing your order...');
        
        // Siapkan detail transaksi untuk dikirim ke Server Action
        const transactionDetails = {
          orderId: details.id,
          payerEmail: details.payer.email_address,
          payerName: `${details.payer.name.given_name} ${details.payer.name.surname}`,
        };
        
        // Kirim detail transaksi bersama item keranjang
        const result = await createOrderAction(cartItems, transactionDetails);
        
        toast.dismiss();

        if (result.error) {
          toast.error(`Order failed: ${result.error}`);
        } else {
          toast.success(result.success!);
          clearCart(); 
          router.push('/account'); 
        }
      });
    } catch (error) {
        toast.error("An error occurred while capturing the payment.");
        console.error("PayPal Capture Error:", error);
    }
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <PayPalButtons
        style={{ layout: "vertical", shape: "pill" }}
        disabled={isPending || cartItems.length === 0 || !cartTotal}
        fundingSource="paypal"
        createOrder={(data, actions) => {
          return actions.order.create({
            intent: "CAPTURE",
            purchase_units: [
              {
                description: "Font purchase from Operatype.co",
                amount: {
                  currency_code: "USD",
                  value: cartTotal.toFixed(2),
                },
              },
            ],
          });
        }}
        onApprove={handleApprove}
        onError={(err) => {
          toast.error("An error occurred with your PayPal transaction.");
          console.error("PayPal Error:", err);
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalWrapper;