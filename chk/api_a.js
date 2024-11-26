// client/src/services/api.js

import axios from "axios";

const API_URL = "http://localhost:5000";

// Store username in memory after successful login
let currentUser = null;

export const login = async (name, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { name, password });
    if (response.data.name) {
      currentUser = response.data.name;
    }
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

export const startNewSession = async () => {
  try {
    const response = await axios.get(`${API_URL}/start-session`, {
      params: { username: currentUser },
    });
    return response.data;
  } catch (error) {
    console.error("Error starting new session:", error);
    throw error;
  }
};

export const uploadImages = async (screenshot, webcamImage, sessionId) => {
  try {
    const formData = new FormData();
    formData.append("screenshot", screenshot);
    formData.append("webcam", webcamImage);

    const response = await axios.post(`${API_URL}/upload`, formData);
    return response.data;
  } catch (error) {
    console.error("Error uploading images:", error);
    throw error;
  }
};

export const fetchSessions = async () => {
  try {
    const response = await axios.get(`${API_URL}/sessions`);
    return response.data.sessions;
  } catch (error) {
    console.error("Error fetching sessions:", error);
    throw error;
  }
};

export const analyzeSession = async (sessionId) => {
  try {
    const response = await axios.get(`${API_URL}/analyze/${sessionId}`);
    return {
      imageAnalyses: response.data.imageAnalyses,
      overallEmotions: response.data.overallAnalysis.emotions,
    };
  } catch (error) {
    console.error("Error analyzing session:", error);
    throw error;
  }
};
