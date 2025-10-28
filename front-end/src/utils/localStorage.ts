interface ICustomLocalStorage {
  getData: (key: string) => string | null;
  saveData: (key: string, data: any) => void;
  deleteData: (key: string) => void;
}

export const customLocalStorage: ICustomLocalStorage = {
  getData: (key: string) => {
    return localStorage.getItem(key);
  },
  saveData: (key: string, data: any) => {
    localStorage.setItem(
      key,
      typeof data === 'string' ? data : JSON.stringify(data)
    );
  },
  deleteData: (key: string) => {
    localStorage.removeItem(key);
  },
};
