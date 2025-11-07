import AxiosInstance from "./config";

export const getChaptersBySeries = async (seriesId: number, page: number = 1, limit: number = 50) => {
  const response = await AxiosInstance.get(`/chapters/series/${seriesId}?page=${page}&limit=${limit}`);
  return response.data;
};

export const getChapterById = async (chapterId: number) => {
  const response = await AxiosInstance.get(`/chapters/${chapterId}`);
  return response.data;
};

export const getChapterByNumber = async (seriesId: number, chapterNumber: number) => {
  const response = await AxiosInstance.get(`/chapters/series/${seriesId}/number/${chapterNumber}`);
  return response.data;
};

export const getAdjacentChapters = async (seriesId: number, chapterNumber: number) => {
  const response = await AxiosInstance.get(`/chapters/series/${seriesId}/adjacent/${chapterNumber}`);
  return response.data;
};

