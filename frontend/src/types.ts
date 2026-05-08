/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  image: string;
  stock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  sku: string;
  available: boolean;
}

export interface Transaction {
  id: string;
  customerName: string;
  customerContact?: string;
  customerId?: string;

  date: string;
  time: string;
  amount: number;
  method: 'UPI' | 'Cash' | 'Card' | 'UDHAR';
  itemsCount: number;
  status: 'Completed' | 'Refunded';
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
}

export type Screen = 'Dashboard' | 'NewBill' | 'Inventory' | 'AddItem' | 'History' | 'Analyzer' | 'TransactionDetail' | 'Profile' | 'Udhar';

export interface Customer {
  id: string;
  full_name: string;
  mobile_number: string;
  alternate_number?: string;
  address?: string;
  notes?: string;
  total_due: number;
  total_paid: number;
  trust_score: number;
  last_transaction_date?: string;
}

export interface UdharTransaction {
  id: string;
  customer_id: string;
  type: 'CREDIT' | 'PAYMENT';
  amount: number;
  remarks: string;
  created_at: string;
}
