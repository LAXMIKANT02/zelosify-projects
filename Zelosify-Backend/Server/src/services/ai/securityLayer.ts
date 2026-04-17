// [AI MODULE]
// [SAFE]
// [NO NEW DEPENDENCIES]

export class SecurityLayer {
  private static readonly MAX_INPUT_LENGTH = 15000;

  static sanitizeInput(text: string): string {
    if (!text) return "";

    let sanitized = text.substring(0, this.MAX_INPUT_LENGTH);

    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    sanitized = sanitized.replace(/javascript:/gi, "");
    sanitized = sanitized.replace(/onload=/gi, "");
    sanitized = sanitized.replace(/onerror=/gi, "");
    
    sanitized = sanitized.replace(/IGNORE ALL PREVIOUS INSTRUCTIONS/gi, "[REDACTED]");
    sanitized = sanitized.replace(/SYSTEM INSTRUCTION:/gi, "[REDACTED]");

    sanitized = sanitized.replace(/\s+/g, " ").trim();

    return sanitized;
  }

  static prepareSafePrompt(systemPrompt: string, untrustedInput: string): string {
    return `--- UNTRUSTED USER INPUT START ---\n${this.sanitizeInput(untrustedInput)}\n--- UNTRUSTED USER INPUT END ---\n`;
  }
}
