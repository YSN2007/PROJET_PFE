import { Slide, toast } from "react-toastify";

const defaultOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  transition: Slide,
};

function buildOptions(type, options = {}) {
  return {
    ...defaultOptions,
    type,
    ...options,
  };
}

export function notifySuccess(message = "Opération réussie ✅", options = {}) {
  return toast.success(message, buildOptions("success", options));
}

export function notifyError(message = "Erreur ❌", options = {}) {
  return toast.error(message, buildOptions("error", options));
}

export function notifyWarning(message = "⚠️ Rattrapage nécessaire", options = {}) {
  return toast.warning(message, buildOptions("warning", options));
}

export function notifyInfo(message = "Stagiaire chargé", options = {}) {
  return toast.info(message, buildOptions("info", options));
}

export function dismissNotification(toastId) {
  toast.dismiss(toastId);
}

export function isNotificationActive(toastId) {
  return toast.isActive(toastId);
}
