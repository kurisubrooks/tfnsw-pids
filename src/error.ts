export interface FormattedError {
  ok: false
  message: string
  stack?: string
}

export function formatError(error: unknown): FormattedError {
  if (error instanceof Error) {
    return {
      ok: false,
      message: error.message,
      stack: error.stack,
    }
  }
  return {
    ok: false,
    message: String(error),
  }
}
