import client from './client';

export const createSession = async (data: {
  name?: string;
  age?: number;
  gender?: string;
  language?: string;
  abhaStatus?: string;
  abhaId?: string;
  inputMode?: string;
  consent?: { given: boolean; timestamp?: string | Date };
  sessionId?: string;
}) => {
  const res = await client.post('/sessions', data);
  return res.data;
};

export const getSession = async (id: string) => {
  const res = await client.get(`/sessions/${id}`);
  return res.data;
};

export const listSessions = async () => {
  const res = await client.get('/sessions');
  return res.data;
};

export const recordConsent = async (id: string, timestamp?: string) => {
  const res = await client.post(`/sessions/${id}/consent`, { timestamp });
  return res.data;
};

export const updateSession = async (id: string, data: any) => {
  const res = await client.put(`/sessions/${id}`, data);
  return res.data;
};
