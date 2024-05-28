import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import UnAuthorized from 'error/unauthorized-error';

interface SessionRequest extends Request {
    user?: string | JwtPayload;
}

const handleAuthError = (res: Response) => {
  return new UnAuthorized('Необходима авторизация');
};

const extractBearerToken = (header: string) => {
  return header.replace('Bearer ', '');
};

export default (req: SessionRequest, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return handleAuthError(res);
  }

  const token = extractBearerToken(authorization);
  let payload;

  try {
    payload = jwt.verify(token, 'super-strong-secret');
  } catch (err) {
    return handleAuthError(res);
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  next(); // пропускаем запрос дальше
};