import { toast, ExternalToast } from "sonner";

export const notify = {
  success: (message: string, data?: ExternalToast) => {
    return toast.success(message, data);
  },
  error: (message: string, data?: ExternalToast) => {
    return toast.error(message, data);
  },
  warning: (message: string, data?: ExternalToast) => {
    return toast.warning(message, data);
  },
  info: (message: string, data?: ExternalToast) => {
    return toast.info(message, data);
  },
  promise: <T>(
    promise: Promise<T> | (() => Promise<T>),
    data: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    } & ExternalToast
  ) => {
    return toast.promise(promise, data);
  },
  dismiss: (id?: string | number) => {
    return toast.dismiss(id);
  },
};
