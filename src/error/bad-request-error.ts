class BadRequesetError extends Error {
  public statusCode;

  constructor(message: string) {
    super(message);
    this.statusCode = 400;
  }
}

export default BadRequesetError;