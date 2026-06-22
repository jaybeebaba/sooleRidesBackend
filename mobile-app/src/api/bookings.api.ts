import { api } from './client';

export type CreateBookingPayload = {
  rideId: string;
  seatsBooked: number;
};

export async function createBooking(payload: CreateBookingPayload) {
  const response = await api.post('/bookings', payload);

  return response.data;
}