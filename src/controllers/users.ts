import { Error as MongooseError } from 'mongoose';
import {
  NextFunction,
  Request,
  Response,
} from 'express';
import { constants } from 'http2';
import { AuthContext } from '../types/types';
import User from '../models/user';
import NotFoundError from '../error/not-found-error';
import ConflictError from '../error/confict-error';
import BadRequesetError from '../error/bad-request-error';

export const getUsers = (req: Request, res: Response, next: NextFunction) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((error) => {
      next(error);
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
  const { name, about, avatar } = req.body;

  User.findOne({ name })
    .then((existingUser) => {
      if (existingUser) {
        throw new ConflictError('Пользователь с таким именем уже существует');
      } else {
        return User.create({ name, about, avatar });
      }
    })
    .then((user) => {
      res.status(constants.HTTP_STATUS_CREATED).send(user);
    })
    .catch((error) => {
      if (error instanceof MongooseError.ValidationError) {
        return next(
          new BadRequesetError(
            `Переданы невалидные данные для создания пользователя: ${error.message}`,
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
      next(error);
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
      next(error);
    });
};
