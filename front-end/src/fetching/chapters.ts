import AxiosInstance from "./config";

export const getChaptersBySeries = async (seriesId: number, page: number = 1, limit: number = 50) => {
  const response = await AxiosInstance.get(`/chapters/series/${seriesId}?page=${page}&limit=${limit}`);
  return response.data;
};

export const getChapterById = async (chapterId: number) => {
  const response = await AxiosInstance.get(`/chapters/${chapterId}`);
  return response.data;
};

// DEPRECATED: number là số ảnh, không duy nhất
export const getChapterByNumber = async (seriesId: number, chapterNumber: number) => {
  const response = await AxiosInstance.get(`/chapters/series/${seriesId}/number/${chapterNumber}`);
  return response.data;
};

// ✅ DÙNG CÁI NÀY: title là số chương thực sự (290, 289...)
export const getChapterByTitle = async (seriesId: number, chapterTitle: string) => {
  const response = await AxiosInstance.get(`/chapters/series/${seriesId}/title/${encodeURIComponent(chapterTitle)}`);
  return response.data;
};

export const getAdjacentChapters = async (seriesId: number, chapterNumber: number) => {
  const response = await AxiosInstance.get(`/chapters/series/${seriesId}/adjacent/${chapterNumber}`);
  return response.data;
};

