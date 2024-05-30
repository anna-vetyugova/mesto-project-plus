import { Error as MongooseError } from 'mongoose';
import {
  NextFunction,
  Request,
  Response,
} from 'express';
import { constants } from 'http2';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthContext } from '../types/types';
import User from '../models/user';
import NotFoundError from '../error/not-found-error';
import ConflictError from '../error/confict-error';
import BadRequesetError from '../error/bad-request-error';
import UnAuthorized from '../error/unauthorized-error';
import { config } from '../../config';

export const getUsers = (req: Request, res: Response, next: NextFunction) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((error) => {
      if (error instanceof NotFoundError) {
        return next(new NotFoundError(error.message));
      }
      return next(error);
    });
};

export const getUserById = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  User.findById(req.params.userId)
    .orFail(new NotFoundError('Пользователь не найден'))
    .then((user) => {
      res.send({ data: user });
    })
    .catch((error) => {
      if (error instanceof MongooseError.CastError) {
        return next(new BadRequesetError('Некорректный ИД пользователя'));
      }
      return next(error);
    });
};

export const createUser = (
  req: Request,
  res: Response<unknown, AuthContext>,
  next: NextFunction,
) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  User.findOne({ email })
    .then((existingUser) => {
      if (existingUser) {
        throw new ConflictError('Пользователь с такой электронной почтой уже существует');
      }
      return bcrypt.hash(password, 10);
    })
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => {
      res.status(constants.HTTP_STATUS_CREATED).send(user);
    })
    .catch((error) => {
      if (error instanceof MongooseError.ValidationError) {
        return next(
          new BadRequesetError(
            `Переданы невалидные данные для регистрации пользователя: ${error.message}`,
          ),
        );
      }
      return next(error);
    });
};

export const updateUserProfile = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = res.locals.user._id;
  const { name, about } = req.body;
  if (!name && !about) {
    throw new BadRequesetError('Переданы невалидные данные: укажите имя и/или описание');
  }
  User.findByIdAndUpdate(
    userId,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }
      res.send({ data: user });
    })
    .catch((error) => {
      if (error instanceof NotFoundError) {
        return next(new NotFoundError(error.message));
      }
      return next(error);
    });
};

export const updateUserAvatar = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = res.locals.user._id;
  const { avatar } = req.body;
  if (!avatar) {
    throw new BadRequesetError('Переданы невалидные данные: укажите аватар');
  }
  User.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }
      res.send({ data: user });
    })
    .catch((error) => {
      if (error instanceof NotFoundError) {
        return next(new NotFoundError(error.message));
      }
      return next(error);
    });
};

export const login = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnAuthorized('Неправильные почта или пароль');
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new UnAuthorized('Неправильные почта или пароль');
          }
          return user;
        });
    })
    .then((user) => { res.send({ token: jwt.sign({ _id: user._id }, config.JWT_SECRET, { expiresIn: '7d' }) }); })
    .catch((error) => {
      if (error instanceof NotFoundError) {
        return next(new NotFoundError(error.message));
      }
      if (error instanceof UnAuthorized) {
        return next(new UnAuthorized(error.message));
      }
      return next(error);
    });
};

export const getUserCurrent = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  User.findById(res.locals.user._id)
    .orFail(new NotFoundError('Пользователь не найден'))
    .then((user) => {
      res.send({ data: user });
    })
    .catch((error) => {
      if (error instanceof MongooseError.CastError) {
        return next(new BadRequesetError('Некорректный ИД пользователя'));
      }
      return next(error);
    });
};
