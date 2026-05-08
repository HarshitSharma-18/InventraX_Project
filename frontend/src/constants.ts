/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Product, Transaction } from './types';

export const PRODUCTS: Product[] = [];
export const RECENT_TRANSACTIONS: Transaction[] = [];

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
