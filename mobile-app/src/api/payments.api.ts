import { api } from './client';

export type InitializePaymentPayload = {
  bookingId: string;
};

export async function initializePayment(payload: InitializePaymentPayload) {
  const response = await api.post('/payments/initialize', payload);

  return response.data;
}