import { ErrorRequestHandler, Request, Response } from 'express';

export const errorHandler: ErrorRequestHandler = (err, req: Request, res: Response, next) => {
  // console.log(err);
  const statusCode = err.statusCode || 500;

  const message = statusCode === 500 ? 'На сервере произошла ошибка!' : err.message;
  res.status(statusCode).send({ message });

  next();
};

export default errorHandler;
