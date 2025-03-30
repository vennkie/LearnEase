import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    "Accept": "application/json",
  },
});


export const chatWithAPI = async (query) => {
  try {
    const response = await api.post("/chat", { query });
    return response.data;
  } catch (error) {
    console.error("Failed to get chat response:", error);
    throw new Error("Failed to get chat response");
  }
};

export const generateQuiz = async () => {
  try {
    const response = await api.get('/quiz');
    return response.data;
  } catch (error) {
    throw new Error('Failed to generate quiz');
  }
};

export const getEmbeddings = async (sentences) => {
  try {
    const response = await api.post('/get_embeddings', { sentences });
    return response.data;
  } catch (error) {
    throw new Error('Failed to get embeddings');
  }
};

export const getSummary = async () => {
  try {
    const response = await api.get('/summarise');
    return response.data;
  } catch (error) {
    throw new Error('Failed to get summary');
  }
}
