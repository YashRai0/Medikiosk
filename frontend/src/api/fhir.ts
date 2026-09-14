import client from './client';

export const getFHIRBundle = async (sessionId: string) => {
  const res = await client.get(`/fhir/${sessionId}`);
  return res.data;
};
