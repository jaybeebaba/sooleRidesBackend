import { api } from './client';

export type SearchRidesParams = {
  origin: string;
  destination: string;
  date?: string;
  seats?: number;
};

export async function searchRides(params: SearchRidesParams) {
  const response = await api.get('/rides/search', {
    params,
  });

  return response.data;
}

export async function getRideById(rideId: string) {
  const response = await api.get(`/rides/${rideId}`);

  return response.data;
}

export async function getPopularRoutes() {
  const response = await api.get('/rides/popular-routes');
  return response.data;
}