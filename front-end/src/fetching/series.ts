import AxiosInstance from "./config";

export const getAllSeries = async (
  page: number = 1, 
  limit: number = 10,
  sortBy: 'latest' | 'popular' | 'created' = 'created'
) => {
  const response = await AxiosInstance.get(`/series?page=${page}&limit=${limit}&sortBy=${sortBy}`);
  return response.data;
};

export const getSeriesById = async (id: number) => {
  const response = await AxiosInstance.get(`/series/${id}`);
  return response.data;
};

