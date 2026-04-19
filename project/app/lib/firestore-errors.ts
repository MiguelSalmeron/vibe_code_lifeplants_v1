type FirestoreErrorLike = {
  code?: unknown;
  message?: unknown;
};

const isFirestoreErrorLike = (error: unknown): error is FirestoreErrorLike => {
  return typeof error === "object" && error !== null;
};

export const formatFirestoreError = (error: unknown, fallbackMessage: string) => {
  if (!isFirestoreErrorLike(error)) {
    return fallbackMessage;
  }

  const code = typeof error.code === "string" ? error.code : "";
  const message = typeof error.message === "string" && error.message.trim() ? error.message.trim() : "";

  if (!code && !message) {
    return fallbackMessage;
  }

  if (code && message) {
    return `${fallbackMessage} (${code}): ${message}`;
  }

  if (code) {
    return `${fallbackMessage} (${code})`;
  }

  return `${fallbackMessage}: ${message}`;
};