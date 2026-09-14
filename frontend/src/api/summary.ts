import client from './client';

export const generateSummary = async (data: {
  sessionId: string;
  touchData?: any;
  messages?: any[];
}) => {
  const res = await client.post('/summary/generate', data);
  return res.data;
};

export const getSummary = async (sessionId: string) => {
  const res = await client.get(`/summary/${sessionId}`);
  return res.data;
};
