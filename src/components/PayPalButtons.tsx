// src/components/PayPalButtons.tsx
'use client';

import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import type { OnApproveData, OnApproveActions } from '@paypal/paypal-js';
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
    console.error("Variabel NEXT_PUBLIC_PAYPAL_CLIENT_ID tidak ditemukan!");
    return <div className="text-center text-red-500">PayPal Client ID not found.</div>;
  }

  const initialOptions = {
    clientId: payPalClientId,
    currency: "USD",
    intent: "capture",
  };

  const handleApprove = async (data: OnApproveData, actions: OnApproveActions) => {
    try {
      if (!actions.order) {
        throw new Error('PayPal actions.order is not available.');
      }
      
      const details = await actions.order.capture();

      if (!details.id) {
        toast.error('Could not get transaction ID. Payment was not completed.');
        console.error("PayPal capture details missing ID:", details);
        return; 
      }
      
      // ✅ PERBAIKAN FINAL: Simpan ID yang sudah divalidasi ke dalam konstanta baru.
      const capturedOrderId = details.id;

      startTransition(async () => {
        toast.loading('Processing your order...');
        
        // Gunakan konstanta `capturedOrderId` di sini. TypeScript sekarang 100% yakin
        // bahwa nilainya adalah string.
        const transactionDetails = {
          orderId: capturedOrderId,
          payerEmail: details.payer?.email_address ?? 'email-not-provided',
          payerName: `${details.payer?.name?.given_name ?? 'Guest'} ${details.payer?.name?.surname ?? ''}`.trim(),
        };
        
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
        onError={(err: Record<string, unknown>) => {
          toast.error("An error occurred with your PayPal transaction.");
          console.error("PayPal Error:", err);
        }}
      />
    </PayPalScriptProvider>
  );
};

export default PayPalWrapper;