import { api } from './client';

export type SavedRoute = {
  id: string;
  origin: string;
  destination: string;
  createdAt?: string;
};

export type CreateSavedRoutePayload = {
  origin: string;
  destination: string;
};

export async function getSavedRoutes() {
  const response = await api.get('/passengers/saved-routes');
  return response.data;
}

export async function createSavedRoute(payload: CreateSavedRoutePayload) {
  const response = await api.post('/passengers/saved-routes', payload);
  return response.data;
}

export async function deleteSavedRoute(id: string) {
  const response = await api.delete(`/passengers/saved-routes/${id}`);
  return response.data;
}