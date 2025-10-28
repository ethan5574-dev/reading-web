import axios from 'axios';

export const getHttpOnlyCookieFromClient = async (data: { name: string }) => {
  const res = await axios.get(process.env.NEXT_PUBLIC_FE_URL + '/api/cookies', {
    params: data,
  });
  return res.data;
};
