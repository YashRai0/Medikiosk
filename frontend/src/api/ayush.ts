import client from './client';

export const createAyushRecord = async (sessionId: string, data: any) => {
  const res = await client.post('/ayush', { sessionId, data });
  return res.data;
};

export const getAyushRecord = async (sessionId: string) => {
  const res = await client.get(`/ayush/${sessionId}`);
  return res.data;
};
