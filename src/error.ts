export interface FormattedError {
  ok: false;
  message: string;
  stack?: string;
}

export default class ErrorFormatter {
  static format(error: any): FormattedError {
    return {
      ok: false,
      message: error?.toString ? error.toString().replace('Error: ', '') : String(error),
      stack: error?.stack
    };
  }
}
