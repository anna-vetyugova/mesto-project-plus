import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UnAuthorized from '../error/unauthorized-error';
import { config } from '../../config';

interface SessionRequest extends Request {
  user?: { _id: string | jwt.JwtPayload };
}

const extractBearerToken = (header: string) => header.replace('Bearer ', '');

const authMiddleware = (req: SessionRequest, res: Response, next: NextFunction) => {
  try {
    const authorization = req.headers.authorization as string;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnAuthorized('Необходима авторизация');
    }
    const token = extractBearerToken(authorization);
    const payload = jwt.verify(token, config.JWT_SECRET);
    res.locals.user = payload;
    next();
  } catch (err) {
    next(new UnAuthorized('Необходима авторизация'));
  }
};

export default authMiddleware;
