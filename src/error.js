export default class Error {
  static format(error) {
    return {
      ok: false,
      message: error.toString().replace('Error: ', ''),
      stack: error.stack
    };
  }
}
