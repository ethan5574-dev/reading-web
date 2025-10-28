import toast from "react-hot-toast";

export const toastSuccess = (message: unknown) => {
  let text = "Success";
  if (typeof message === "string") text = message;
  else if (message && typeof message === "object") text = (message as any)?.message || JSON.stringify(message);
  toast.success(text);
};

export const toastError = (error: unknown) => {
  let text = "Something went wrong";
  if (typeof error === "string") text = error;
  else if (error && typeof error === "object") {
    const anyErr = error as any;
    text = anyErr?.response?.data?.message || anyErr?.message || JSON.stringify(anyErr);
  }
  toast.error(text);
};


