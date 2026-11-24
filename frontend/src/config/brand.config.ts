/**
 * Centralized brand configuration derived from environment variables.
 * To change the brand name or subtitle, configure VITE_BRAND_NAME and
 * VITE_BRAND_SUBTITLE in your .env / .env.local file.
 */
export const BRAND_CONFIG = {
  name: import.meta.env.VITE_BRAND_NAME || "Conforge",
  subtitle: import.meta.env.VITE_BRAND_SUBTITLE || "Solutions Hub",

  /**
   * Returns formatted full product name (e.g., "Conforge Solutions Hub")
   */
  get fullName(): string {
    return this.subtitle ? `${this.name} ${this.subtitle}` : this.name;
  },

  /**
   * Returns formatted browser page title (e.g., "Conforge - Solutions Hub")
   */
  get pageTitle(): string {
    return this.subtitle ? `${this.name} - ${this.subtitle}` : this.name;
  },
} as const;
