class NotFoundError extends Error {
  public statusCode;

  constructor(message: string) {
    super(message);
    this.statusCode = 404;
  }
}

export default NotFoundError;
