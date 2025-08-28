// src/components/emails/AdminSaleNotificationEmail.tsx
import * as React from 'react';
import { Html, Head, Body, Container, Heading, Text, Section, Row, Column, Hr, Img } from '@react-email/components';

interface AdminEmailProps {
  orderId: string;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  items: {
    name: string | null;
    amount: number | null;
  }[];
}

const AdminSaleNotificationEmail: React.FC<AdminEmailProps> = ({ orderId, totalAmount, customerName, customerEmail, items }) => {
  const websiteUrl = 'https://www.operatype.co';
  // ==================== PERBAIKAN LOGO DI SINI ====================
  const logoUrl = `${websiteUrl}/logo-operatype.png`;
  // ===============================================================

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={{ textAlign: 'center' }}>
            <Img src={logoUrl} width="150" alt="Operatype.co Logo" />
          </Section>
          <Heading style={heading}>🎉 New Sale!</Heading>
          <Text style={paragraph}>A new purchase has been made on Operatype.co.</Text>
          <Hr style={hr} />
          <Heading as="h2" style={subheading}>Sale Details</Heading>
          <Row>
            <Column style={label}>Order ID:</Column>
            <Column>#{orderId}</Column>
          </Row>
          <Row>
            <Column style={label}>Customer:</Column>
            <Column>{customerName} ({customerEmail})</Column>
          </Row>
          <Row>
            <Column style={label}>Total Amount:</Column>
            <Column style={{ fontWeight: 'bold', color: '#C8705C' }}>${totalAmount.toFixed(2)}</Column>
          </Row>
          <Hr style={hr} />
          <Heading as="h2" style={subheading}>Items Purchased</Heading>
          {items.map((item, index) => (
            <Row key={index}>
              <Column>{item.name || 'Unknown Font'}</Column>
              <Column style={{ textAlign: 'right' }}>${item.amount?.toFixed(2)}</Column>
            </Row>
          ))}
        </Container>
      </Body>
    </Html>
  );
};

export default AdminSaleNotificationEmail;

const main = { backgroundColor: '#f9f9f9', fontFamily: 'Arial, sans-serif' };
const container = { backgroundColor: '#ffffff', border: '1px solid #ddd', borderRadius: '5px', margin: '20px auto', padding: '20px', width: '100%', maxWidth: '600px' };
const heading = { fontSize: '24px', fontWeight: 'bold', color: '#333', textAlign: 'center' as const };
const subheading = { fontSize: '18px', fontWeight: 'bold', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' };
const paragraph = { fontSize: '16px', lineHeight: '1.5', color: '#555', textAlign: 'center' as const };
const hr = { borderColor: '#cccccc', margin: '20px 0' };
const label = { width: '120px', color: '#888' };