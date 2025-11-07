export const formatWallet = (address: any) => {
  if (!address) return '';
  return `${address?.slice(0, 5)}...${address?.slice(-4)}`;
};

export const formatStarknet = (address: any) => {
  if (!address) return '';
  return (
    address.split('x')[0] +
    'x' +
    '0'.repeat(66 - address.length) +
    address.split('x')[1]
  );
};

export const handleCopy = async (text: string, setCopied: any) => {
  try {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
};

export const formatTimeUnit = (timeUnit: any) => {
  return timeUnit < 10 ? `0${timeUnit}` : `${timeUnit}`;
};

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const customUnitFn = (px: any, baseFontSize = 16) => {
  return `${px / baseFontSize}rem`;
};

/**
 * Convert tên series thành slug để dùng cho URL
 * Ví dụ: "Ta Không Muốn Làm Anh Hùng" -> "ta-khong-muon-lam-anh-hung"
 */
export const slugify = (text: string): string => {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Chuẩn hóa Unicode
    .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
    .replace(/đ/g, 'd') // Đổi đ thành d
    .replace(/Đ/g, 'D') // Đổi Đ thành D
    .trim()
    .replace(/\s+/g, '-') // Thay khoảng trắng bằng -
    .replace(/[^\w\-]+/g, '') // Xóa ký tự đặc biệt
    .replace(/\-\-+/g, '-') // Thay nhiều - bằng 1 -
    .replace(/^-+/, '') // Xóa - ở đầu
    .replace(/-+$/, ''); // Xóa - ở cuối
};
