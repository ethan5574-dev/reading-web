import { AxiosInstance } from "./config";

export const incrementView = async (postId: number) => {
  const response = await AxiosInstance.post(`/views/${postId}`);
  return response.data;
};