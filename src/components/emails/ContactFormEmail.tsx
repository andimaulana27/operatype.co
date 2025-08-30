// src/components/emails/ContactFormEmail.tsx
import * as React from 'react';
import { Html, Head, Body, Container, Heading, Text, Section, Hr } from '@react-email/components';

interface ContactEmailProps {
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
}

const ContactFormEmail: React.FC<ContactEmailProps> = ({ senderName, senderEmail, subject, message }) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>New Message from Contact Form</Heading>
          <Text style={paragraph}>You have received a new message from your website's contact form.</Text>
          <Hr style={hr} />
          <Section>
            <Text><strong>From:</strong> {senderName}</Text>
            <Text><strong>Email:</strong> {senderEmail}</Text>
            <Text><strong>Subject:</strong> {subject}</Text>
          </Section>
          <Hr style={hr} />
          <Heading as="h2" style={subheading}>Message:</Heading>
          <Text style={messageBox}>{message}</Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ContactFormEmail;

// --- Styles ---
const main = { backgroundColor: '#f9f9f9', fontFamily: 'Arial, sans-serif' };
const container = { backgroundColor: '#ffffff', border: '1px solid #ddd', borderRadius: '5px', margin: '20px auto', padding: '20px', width: '100%', maxWidth: '600px' };
const heading = { fontSize: '24px', fontWeight: 'bold', color: '#333', textAlign: 'center' as const };
const subheading = { fontSize: '18px', fontWeight: 'bold', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px' };
const paragraph = { fontSize: '16px', lineHeight: '1.5', color: '#555', textAlign: 'center' as const };
const messageBox = { backgroundColor: '#f1f1f1', padding: '15px', borderRadius: '5px', lineHeight: '1.6' };
const hr = { borderColor: '#cccccc', margin: '20px 0' };