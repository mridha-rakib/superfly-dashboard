import { toast as sonnerToast } from "sonner";
import { getErrorMessage } from "./api-error";

const mergeClasses = (...values) => values.filter(Boolean).join(" ");

const TONE_CLASS_NAMES = {
  success: {
    toast: "border-[#C85344]/20 bg-[#fff7f5] text-[#7b2f25]",
    description: "text-[#9a493d]",
    actionButton: "!bg-[#C85344] !text-white hover:!bg-[#b54538]",
  },
  error: {
    toast: "border-red-200 bg-red-50 text-red-900",
    description: "text-red-700",
    actionButton: "!bg-red-600 !text-white hover:!bg-red-700",
  },
  warning: {
    toast: "border-amber-200 bg-amber-50 text-amber-900",
    description: "text-amber-700",
    actionButton: "!bg-amber-600 !text-white hover:!bg-amber-700",
  },
  info: {
    toast: "border-slate-200 bg-white text-slate-900",
    description: "text-slate-600",
    actionButton: "!bg-slate-900 !text-white hover:!bg-slate-800",
  },
};

const buildToastOptions = (variant, options = {}) => {
  const {
    toastId,
    className,
    classNames = {},
    descriptionClassName,
    ...rest
  } = options;
  const tone = TONE_CLASS_NAMES[variant] || TONE_CLASS_NAMES.info;

  return {
    id: rest.id ?? toastId,
    duration: 4000,
    ...rest,
    classNames: {
      toast: mergeClasses(tone.toast, className, classNames.toast),
      title: mergeClasses("text-sm font-semibold", classNames.title),
      description: mergeClasses(
        "text-sm",
        tone.description,
        descriptionClassName,
        classNames.description
      ),
      actionButton: mergeClasses(tone.actionButton, classNames.actionButton),
      cancelButton: mergeClasses(
        "!border !border-slate-200 !bg-white !text-slate-700 hover:!bg-slate-50",
        classNames.cancelButton
      ),
    },
  };
};

export const toast = {
  success: (message, options) =>
    sonnerToast.success(message, buildToastOptions("success", options)),
  error: (message, options) =>
    sonnerToast.error(message, buildToastOptions("error", options)),
  info: (message, options) =>
    sonnerToast.info(message, buildToastOptions("info", options)),
  warn: (message, options) =>
    sonnerToast.warning(message, buildToastOptions("warning", options)),
  warning: (message, options) =>
    sonnerToast.warning(message, buildToastOptions("warning", options)),
  message: (message, options) =>
    sonnerToast(message, buildToastOptions("info", options)),
  dismiss: (...args) => sonnerToast.dismiss(...args),
};

export const notifyApiError = (error, fallback, options) =>
  toast.error(getErrorMessage(error, fallback), options);
