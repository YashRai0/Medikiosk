import client from './client';

export const addMessage = async (data: {
  sessionId: string;
  role: 'ai' | 'patient';
  message: string;
  transcript?: string;
}) => {
  const res = await client.post('/conversation/message', data);
  return res.data;
};

export const getConversation = async (sessionId: string) => {
  const res = await client.get(`/conversation/${sessionId}`);
  return res.data;
};

export const getNextQuestion = async (data: {
  sessionId?: string;
  step?: number;
  language?: string;
}) => {
  const res = await client.post('/conversation/next-question', data);
  return res.data;
};
