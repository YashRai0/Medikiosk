import client from './client';

export const processDocument = async (formData: FormData) => {
  const res = await client.post('/ocr/process', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const getSessionDocuments = async (sessionId: string) => {
  const res = await client.get(`/ocr/session/${sessionId}`);
  return res.data;
};

export const getDocument = async (documentId: string) => {
  const res = await client.get(`/ocr/${documentId}`);
  return res.data;
};
