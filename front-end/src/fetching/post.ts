import AxiosInstance from "./config";

export const getAllPosts = async (page: number = 1, limit: number = 10) => {
  const response = await AxiosInstance.get(`/posts?page=${page}&limit=${limit}`);
  return response.data;
};

export const getPost = async (id: number) => {  
  const response = await AxiosInstance.get(`/posts/${id}`);
  return response.data;
};

export const getPostsByAuthor = async (page: number = 1, limit: number = 10) => {
  const response = await AxiosInstance.get(`/posts/author?page=${page}&limit=${limit}`);
  return response.data;
};

export const getTopView = async (time: number = 30, quantity: number = 10) => {
  const response = await AxiosInstance.get(`/posts/top-views?time=${time}&quantity=${quantity}`);
  return response.data;
};

export const createPost = async (data: any) => {
  const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
  const response = await AxiosInstance.post('/posts/with-image', data, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
  });
  return response.data;
};

export const updatePost = async (id: number, data: any) => {
  const response = await AxiosInstance.put(`/posts/${id}`, data);
  return response.data;
};

export const deletePost = async (id: number) => {
  const response = await AxiosInstance.delete(`/posts/${id}`);
  return response.data;
};

export const searchPosts = async (query: string, page: number = 1, limit: number = 10) => {
  const params = new URLSearchParams({
    q: query,
    page: page.toString(),
    limit: limit.toString(),
  });
  const response = await AxiosInstance.get(`/posts/search?${params.toString()}`);
  return response.data;
};


