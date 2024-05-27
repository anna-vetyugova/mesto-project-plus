import { Error as MongooseError } from 'mongoose';
import {
  NextFunction,
  Request,
  Response,
} from 'express';
import { constants } from 'http2';
import Card from '../models/card';
import NotFoundError from '../error/not-found-error';
import BadRequestError from '../error/bad-request-error';

export const getCards = (req: Request, res: Response, next: NextFunction) => {
  Card.find({})
    .then((users) => res.send({ data: users }))
    .catch((error) => {
      if (error instanceof NotFoundError) {
        return next(new NotFoundError(error.message));
      }
      return next(error);
    });
};

export const createCard = (req: Request, res: Response, next: NextFunction) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: res.locals.user._id })
    .then((card) => {
      res.status(constants.HTTP_STATUS_CREATED).send(card);
    })
    .catch((error) => {
      if (error instanceof MongooseError.ValidationError) {
        return next(
          new BadRequestError(
            `Переданы невалидные данные для создания карточки: ${error.message}`,
          ),
        );
      }
      return next(error);
    });
};

export const deleteCard = (req: Request, res: Response, next: NextFunction) => {
  const { cardId } = req.params;
  Card.findByIdAndDelete(cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка не найдена');
      }
      res.send({ data: card });
    })
    .catch((error) => {
      if (error instanceof MongooseError.ValidationError) {
        return next(
          new BadRequestError(
            `Переданы невалидные данные для удаления карточки: ${error.message}`,
          ),
        );
      }
      if (error instanceof MongooseError.CastError) {
        return next(new BadRequestError('Некорректный ИД карточки'));
      }
      return next(error);
    });
};

export const likeCard = (req: Request, res: Response, next: NextFunction) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: res.locals.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .orFail(new NotFoundError('Карточка не найдена'))
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка не найдена');
      }
      res.send({ data: card });
    })
    .catch((error) => {
      if (error instanceof NotFoundError) {
        return next(new NotFoundError(error.message));
      }
      if (error instanceof MongooseError.CastError) {
        return next(new BadRequestError('Некорректный ИД карточки'));
      }
      return next(error);
    });
};

export const dislikeCard = (req: Request, res: Response, next: NextFunction) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: res.locals.user._id } }, // убрать _id из массива
    { new: true },
  )
    .orFail(new NotFoundError('Карточка не найдена'))
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка не найдена');
      }
      res.send({ data: card });
    })
    .catch((error) => {
      if (error instanceof NotFoundError) {
        return next(new NotFoundError(error.message));
      }
      if (error instanceof MongooseError.CastError) {
        return next(new BadRequestError('Некорректный ИД карточки'));
      }
      return next(error);
    });
};
