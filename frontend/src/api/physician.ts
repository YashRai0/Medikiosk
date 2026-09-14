import client from './client';

export const getPhysicianHistory = async (sessionId: string) => {
  const res = await client.get(`/physician/${sessionId}`);
  return res.data;
};

export const updatePhysicianHistory = async (sessionId: string, data: any) => {
  const res = await client.put(`/physician/${sessionId}`, data);
  return res.data;
};

export const approveHistory = async (sessionId: string, doctorId?: string) => {
  const res = await client.post(`/physician/${sessionId}/approve`, { doctorId });
  return res.data;
};

export const rejectHistory = async (sessionId: string) => {
  const res = await client.post(`/physician/${sessionId}/reject`);
  return res.data;
};

export const sendBackHistory = async (sessionId: string) => {
  const res = await client.post(`/physician/${sessionId}/send-back`);
  return res.data;
};
