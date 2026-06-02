export interface NormalizedApiError {
  kind: "network" | "auth" | "rate_limit" | "bad_request" | "server_error" | "parse_error";
  message: string;
  status?: number;
  retryable: boolean;
}

/**
 * Normalizes any caught error during API communications to a predictable format.
 */
export function normalizeApiError(error: any): NormalizedApiError {
  // If it's already normalized, return it
  if (error && typeof error === "object" && "kind" in error && "retryable" in error) {
    return error as NormalizedApiError;
  }

  // Handle Response objects (if caught raw)
  if (error instanceof Response || (error && typeof error === "object" && typeof (error as any).status === "number" && "ok" in error)) {
    const status = error.status;
    let message = `API responded with error ${status}`;
    
    if (status === 400) {
      return {
        kind: "bad_request",
        message: "Fehlerhafte Anfrage. Bitte überprüfen Sie den übergebenen Text.",
        status,
        retryable: false
      };
    }
    if (status === 401 || status === 403) {
      return {
        kind: "auth",
        message: "Nicht autorisiert. Bitte prüfen Sie Ihre API-Zugangsdaten (VITE_WORDTHREAT_API_BASE_URL).",
        status,
        retryable: false
      };
    }
    if (status === 429) {
      return {
        kind: "rate_limit",
        message: "Zu viele Anfragen zur gleichen Zeit. Bitte versuchen Sie es in Kürze noch einmal.",
        status,
        retryable: true
      };
    }
    if (status >= 500) {
      return {
        kind: "server_error",
        message: "Etwas ist auf dem Serviceserver schiefgelaufen. Bitte kontaktieren Sie den Administrator.",
        status,
        retryable: true
      };
    }

    return {
      kind: "server_error",
      message,
      status,
      retryable: true
    };
  }

  // Handle JS Errors (Network failure, type error, etc.)
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    
    // Likely network interruption
    if (
      msg.includes("fetch") || 
      msg.includes("network") || 
      msg.includes("failed to fetch") ||
      msg.includes("dns") ||
      msg.includes("offline")
    ) {
      return {
        kind: "network",
        message: "Der Verbindung zum Wordthreat API Server fehlgeschlagen. Bitte prüfen Sie, ob der Service online ist.",
        retryable: true
      };
    }

    // Likely JSON/Schema parse mistake
    if (msg.includes("json") || msg.includes("unexpected token") || msg.includes("syntaxerror")) {
      return {
        kind: "parse_error",
        message: "Antwort konnte nicht korrekt analysiert werden. Unerwartetes Datenformat.",
        retryable: false
      };
    }

    // Generic standard error
    return {
      kind: "server_error",
      message: error.message,
      retryable: true
    };
  }

  // Fallback for weird payloads
  return {
    kind: "server_error",
    message: String(error || "Ein unbekannter Schnittstellenfehler ist aufgetreten."),
    retryable: true
  };
}
