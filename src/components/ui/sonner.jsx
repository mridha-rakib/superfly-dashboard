import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => (
  <Sonner
    theme="light"
    className="toaster"
    icons={{
      success: <CircleCheckIcon className="size-4" />,
      info: <InfoIcon className="size-4" />,
      warning: <TriangleAlertIcon className="size-4" />,
      error: <OctagonXIcon className="size-4" />,
      loading: <Loader2Icon className="size-4 animate-spin" />,
    }}
    toastOptions={{
      classNames: {
        toast:
          "group rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-lg",
        title: "text-sm font-semibold",
        description: "text-sm text-slate-600",
      },
    }}
    {...props}
  />
);

export { Toaster };
