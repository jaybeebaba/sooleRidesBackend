import { api } from './client';

export type EmergencyContact = {
  id: string;
  fullName: string;
  phone: string;
  relationship?: string;
  createdAt?: string;
};

export type CreateEmergencyContactPayload = {
  fullName: string;
  phone: string;
  relationship?: string;
};

export async function getEmergencyContacts() {
  const response = await api.get('/passengers/emergency-contacts');
  return response.data;
}

export async function createEmergencyContact(
  payload: CreateEmergencyContactPayload,
) {
  const response = await api.post('/passengers/emergency-contacts', payload);
  return response.data;
}

export async function deleteEmergencyContact(id: string) {
  const response = await api.delete(`/passengers/emergency-contacts/${id}`);
  return response.data;
}