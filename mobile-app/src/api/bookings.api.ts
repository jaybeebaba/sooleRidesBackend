import { api } from './client';

export type CreateBookingPayload = {
  rideId: string;
  seatsBooked: number;
};

export async function createBooking(payload: CreateBookingPayload) {
  const response = await api.post('/bookings', payload);

  return response.data;
}

// export async function getMyBookings() {
//   const response = await api.get('/bookings/my-bookings');

//   return response.data;
// }

export async function getMyBookings(page = 1, limit = 10) {
  const response = await api.get('/bookings/my-bookings', {
    params: {
      page,
      limit,
    },
  });

  return response.data;
}

export async function cancelBooking(bookingId: string) {
  const response = await api.patch(`/bookings/${bookingId}/cancel`);

  return response.data;
}