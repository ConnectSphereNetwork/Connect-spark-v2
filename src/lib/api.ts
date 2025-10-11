import axios from "axios";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://connectsphere-hcim.onrender.com";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

async function handleApiError(error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "An unknown error occurred on the server.");
    }
    throw error;
}

export async function getJson<T = any>(path: string): Promise<T> {
  try {
    const response = await apiClient.get<T>(path);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function postJson<T = any>(path: string, body: Record<string, any>): Promise<T> {
  try {
    const response = await apiClient.post<T>(path, body);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function putJson<T = any>(path: string, body: Record<string, any> = {}): Promise<T> {
  try {
    const response = await apiClient.put<T>(path, body);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}

export async function deleteJson<T = any>(path: string): Promise<T> {
  try {
    const response = await apiClient.delete<T>(path);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
}