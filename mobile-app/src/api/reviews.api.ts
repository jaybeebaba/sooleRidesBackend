import { api } from './client';

export type CreateReviewPayload = {
  bookingId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
};

export async function createReview(payload: CreateReviewPayload) {
  const response = await api.post('/reviews', payload);

  return response.data;
}