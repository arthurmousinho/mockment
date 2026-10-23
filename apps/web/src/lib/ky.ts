import ky, { HTTPError } from "ky";
import { toast } from "sonner";

export const api = ky.create({
  prefix: import.meta.env.VITE_API_URL,
});

export function apiErrorHandler(error: unknown) {
  if (error instanceof HTTPError) {
    const data = error.data;
    const message =
      data && typeof data === "object" && "message" in data
        ? data.message
        : undefined;
    const messages = (Array.isArray(message) ? message : [message]).filter(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0,
    );

    if (messages.length > 0) {
      messages.forEach((msg) => toast.error(msg));
    } else {
      toast.error(`Request failed (${error.response.status}). Please try again.`);
    }
    return;
  }

  toast.error("An unexpected error occurred.");
}
