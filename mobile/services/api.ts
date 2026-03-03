import axios from 'axios';
import { API_BASE_URL } from '@constants/config';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

