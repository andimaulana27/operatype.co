// src/components/invoices/InvoiceTemplate.tsx
'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

type PurchaseWithDetails = {
    invoice_id: string | null;
    created_at: string;
    total_amount: number | null;
    order_items: {
        license_type: string | null;
        amount: number | null;
        fonts: { name: string | null; } | null;
    }[];
    profiles: { full_name: string | null; email: string | null; } | null;
};
type InvoiceProps = { purchase: PurchaseWithDetails; };
const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 11, paddingTop: 30, paddingLeft: 60, paddingRight: 60, paddingBottom: 65, color: '#1a1a1a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 },
  logo: { width: 120 },
  headerRight: { textAlign: 'right' },
  invoiceTitle: { fontSize: 28, fontWeight: 'bold', color: '#C8705C' },
  companyInfo: { fontSize: 9, color: '#666' },
  invoiceInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  infoColumn: { maxWidth: '45%' },
  infoTitle: { fontSize: 10, color: '#888', marginBottom: 4 },
  infoText: { fontSize: 11, fontWeight: 'bold' },
  table: { width: '100%' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center', minHeight: 28 },
  tableHeader: { backgroundColor: '#f9f9f9', borderBottomWidth: 2, borderBottomColor: '#C8705C' },
  th: { padding: 8, fontSize: 10, fontWeight: 'bold', color: '#333' },
  td: { padding: 8 },
  colDescription: { width: '60%' },
  colLicense: { width: '25%' },
  colAmount: { width: '15%', textAlign: 'right' },
  summary: { flexDirection: 'row', marginTop: 20 },
  summaryText: { flexGrow: 1, textAlign: 'right', paddingRight: 10, fontSize: 11 },
  summaryTotal: { width: '15%', textAlign: 'right', fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 30, left: 60, right: 60, textAlign: 'center', color: '#888', fontSize: 9 },
});

const InvoiceTemplate: React.FC<InvoiceProps> = ({ purchase }) => {
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image style={styles.logo} src={`${baseUrl}/logo.svg`} />
          <View style={styles.headerRight}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.companyInfo}>Operatype.co</Text>
          </View>
        </View>
        <View style={styles.invoiceInfo}>
          <View style={styles.infoColumn}>
            <Text style={styles.infoTitle}>BILL TO</Text>
            <Text style={styles.infoText}>{purchase.profiles?.full_name || 'N/A'}</Text>
            <Text>{purchase.profiles?.email || 'N/A'}</Text>
          </View>
          <View style={[styles.infoColumn, {alignItems: 'flex-end'}]}>
            <Text style={styles.infoTitle}>INVOICE NUMBER</Text>
            <Text style={styles.infoText}>{purchase.invoice_id || 'N/A'}</Text>
            <Text style={styles.infoTitle}>DATE OF ISSUE</Text>
            <Text style={styles.infoText}>{formatDate(purchase.created_at)}</Text>
          </View>
        </View>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.th, styles.colDescription]}>DESCRIPTION</Text>
            <Text style={[styles.th, styles.colLicense]}>LICENSE</Text>
            <Text style={[styles.th, styles.colAmount]}>AMOUNT</Text>
          </View>
          {purchase.order_items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.td, styles.colDescription]}>{item.fonts?.name}</Text>
              <Text style={[styles.td, styles.colLicense]}>{item.license_type}</Text>
              <Text style={[styles.td, styles.colAmount]}>${item.amount?.toFixed(2)}</Text>
            </View>
          ))}
        </View>
        <View style={styles.summary}>
          <Text style={styles.summaryText}>Total</Text>
          <Text style={styles.summaryTotal}>${purchase.total_amount?.toFixed(2)}</Text>
        </View>
        <Text style={styles.footer}>Thank you for your purchase! If you have any questions, please contact us.</Text>
      </Page>
    </Document>
  );
};

export default InvoiceTemplate;