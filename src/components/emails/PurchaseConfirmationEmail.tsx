// src/components/emails/PurchaseConfirmationEmail.tsx
import * as React from 'react';
import { Html, Head, Body, Container, Heading, Text, Section, Row, Column, Hr, Img, Button } from '@react-email/components';

interface EmailProps {
  customerName: string;
  orderId: string;
  orders: {
    fonts: { name: string | null } | null;
    amount: number | null;
    license_type: string | null;
  }[];
  downloadLinks: { name: string; url: string }[];
}

const PurchaseConfirmationEmail: React.FC<EmailProps> = ({ customerName, orderId, orders, downloadLinks }) => {
  const totalAmount = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
  const websiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.operatype.co';
  const logoUrl = `${websiteUrl}/logo-operatype.png`;

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Img src={logoUrl} width="150" alt="Operatype.co Logo" style={logo} />
          <Heading style={heading}>Thank you for your purchase!</Heading>
          <Text style={paragraph}>Hi {customerName},</Text>
          <Text style={paragraph}>
            Your order is complete. You can download your purchased fonts using the links below. These links are valid for a limited time.
          </Text>
          
          <Section style={{ margin: '32px 0' }}>
            <Heading as="h2" style={subheading}>Your Downloads</Heading>
            {downloadLinks.map((link, index) => (
              <Section key={index} style={downloadSection}>
                <Text style={itemText}><strong>{link.name}</strong></Text>
                <Button href={link.url} style={button}>Download Font</Button>
              </Section>
            ))}
          </Section>

          <Hr style={hr} />

          <Heading as="h2" style={subheading}>Order Summary</Heading>
          <Text><strong>Order ID:</strong> #{orderId}</Text>
          
          {orders.map((order, index) => (
            <Row key={index} style={itemRow}>
              <Column>
                <Text style={itemText}><strong>{order.fonts?.name || 'Font'}</strong> ({order.license_type})</Text>
              </Column>
              <Column style={itemPrice}>
                <Text style={itemText}>${order.amount?.toFixed(2)}</Text>
              </Column>
            </Row>
          ))}
          
          <Hr style={hr} />

          <Row style={totalRow}>
            <Column><Text style={totalText}><strong>Total</strong></Text></Column>
            <Column style={totalPrice}><Text style={totalText}><strong>${totalAmount.toFixed(2)}</strong></Text></Column>
          </Row>

          <Text style={footer}>
            You can also access your purchases anytime by logging into your account dashboard.
            <br />
            © {new Date().getFullYear()} Operatype.co. All Rights Reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default PurchaseConfirmationEmail;

// --- Styles ---
const main = { backgroundColor: '#f6f9fc', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif' };
const container = { backgroundColor: '#ffffff', border: '1px solid #eee', borderRadius: '5px', boxShadow: '0 5px 15px rgba(0,0,0,0.08)', margin: '20px auto', padding: '20px', width: '580px' };
const logo = { margin: '0 auto' };
const heading = { fontSize: '24px', lineHeight: '1.3', fontWeight: '700', color: '#484848', textAlign: 'center' as const };
const subheading = { fontSize: '18px', lineHeight: '1.3', fontWeight: '700', color: '#484848' };
const paragraph = { fontSize: '16px', lineHeight: '1.6', color: '#484848' };
const button = { backgroundColor: '#C8705C', borderRadius: '8px', color: '#fff', fontSize: '16px', textDecoration: 'none', textAlign: 'center' as const, display: 'inline-block', padding: '14px 24px' };
const hr = { borderColor: '#cccccc', margin: '20px 0' };
const footer = { color: '#8898aa', fontSize: '12px', lineHeight: '16px', textAlign: 'center' as const, marginTop: '20px' };
const itemRow = { padding: '5px 0' };
const itemText = { margin: '0', color: '#484848', fontSize: '16px' };
const itemPrice = { textAlign: 'right' as const };
const totalRow = { fontWeight: '700' };
const totalText = { margin: '0', fontSize: '16px', color: '#484848' };
const totalPrice = { textAlign: 'right' as const };
const downloadSection = { border: '1px solid #eee', borderRadius: '5px', padding: '15px', marginBottom: '10px' };