/**
 * Base error class for all EcoPulse application errors.
 */
export class EcoPulseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when local storage state parsing or validation fails.
 */
export class StorageHydrationError extends EcoPulseError {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message);
  }
}

/**
 * Thrown when the backend API fails to generate insights.
 */
export class ApiInsightsError extends EcoPulseError {
  constructor(message: string, public readonly status?: number) {
    super(message);
  }
}

/**
 * Thrown when the Groq AI service call times out.
 */
export class GroqTimeoutError extends EcoPulseError {
  constructor(message: string) {
    super(message);
  }
}
