import AxiosInstance from "./config";

/**
 * Track view cho một chapter
 */
export const trackChapterView = async (chapterId: number) => {
  const response = await AxiosInstance.post(`/views/track`, { chapterId });
  return response.data;
};

/**
 * Lấy tổng số views của chapter (all time)
 */
export const getChapterTotalViews = async (chapterId: number) => {
  const response = await AxiosInstance.get(`/views/chapter/${chapterId}/total`);
  return response.data;
};

/**
 * Lấy views của chapter trong N ngày gần nhất
 */
export const getChapterRecentViews = async (chapterId: number, days: number = 7) => {
  const response = await AxiosInstance.get(`/views/chapter/${chapterId}/recent?days=${days}`);
  return response.data;
};

/**
 * Lấy views trong khoảng thời gian cụ thể
 */
export const getChapterViewsByDateRange = async (
  chapterId: number,
  startDate: string,
  endDate: string
) => {
  const response = await AxiosInstance.get(
    `/views/chapter/${chapterId}/range?start=${startDate}&end=${endDate}`
  );
  return response.data;
};

/**
 * Lấy top chapters có nhiều views nhất
 */
export const getTopChapters = async (limit: number = 10, days?: number) => {
  const url = days
    ? `/views/top?limit=${limit}&days=${days}`
    : `/views/top?limit=${limit}`;
  const response = await AxiosInstance.get(url);
  return response.data;
};


