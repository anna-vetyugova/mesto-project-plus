class UnAuthorized extends Error {
  public statusCode;

  constructor(message: string) {
    super(message);
    this.statusCode = 401;
  }
}

export default UnAuthorized;
