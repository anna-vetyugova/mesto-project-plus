import mongoose from "mongoose";
import { Error as MongooseError } from "mongoose";

import { NextFunction, Request, Response } from "express";
import Card from "../models/card";
import { constants } from "http2";

import NotFoundError from "../error/not-found-error";
import ConflictError from "../error/confict-error";
import BadRequesetError from "../error/bad-request-error";

export const getCards = (req: Request, res: Response) => {
  Card.find({})
    .then((users) => res.send({ data: users }))
    .catch(() =>
      res
        .status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR)
        .send({ message: "Произошла ошибка" })
    );
};

export const createCard = (req: Request, res: Response, next: NextFunction) => {
  const { name, link } = req.body;
  const userId = res.locals.user._id;

  Card.create({ name, link, owner: userId })
    .then((card) => {
      res.status(constants.HTTP_STATUS_CREATED).send(card);
    })
    .catch((error) => {
      if (error instanceof MongooseError.ValidationError) {
        next(
          new BadRequesetError(
            `Переданы невалидные данные для создания карточки: ${error.message}`
          )
        );
      } else {
        next(error);
      }
    });
};

export const deleteCard = (req: Request, res: Response, next: NextFunction) => {
  const { cardId } = req.params;
  Card.findByIdAndDelete(cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError("Карточка не найдена");
      }
      res.send({ data: card });
    })
    .catch((error) => {
      console.log(error);
      if (error instanceof MongooseError.ValidationError) {
        next(
          new BadRequesetError(
            `Переданы невалидные данные для удаления карточки: ${error.message}`
          )
        );
      }
      if (error instanceof MongooseError.CastError) {
        next(new BadRequesetError("Некорректный ИД карточки"));
      } else next(error);
    });
};

export const likeCard = (req: Request, res: Response, next: NextFunction) => {
  const cardId = req.params.cardId;
  const userId = res.locals.user._id;
  Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: userId } }, // добавить _id в массив, если его там нет
    { new: true }
  )
    .orFail(new NotFoundError("Карточка не найдена"))
    .then((card) => {
      if (!card) {
        throw new NotFoundError("Карточка не найдена");
      }
      res.send({ data: card });
    })
    .catch((error) => {
      if (error instanceof NotFoundError) {
        next(new NotFoundError(error.message));
      }
      if (error instanceof MongooseError.CastError) {
        next(new BadRequesetError("Некорректный ИД карточки"));
      }
      next(error);
    });
};

export const dislikeCard = (req: Request, res: Response, next: NextFunction) => {
  const userId = res.locals.user._id;
  const cardId = req.params.cardId;
  Card.findByIdAndUpdate(
    cardId,
    { $pull: { likes: userId } }, // убрать _id из массива
    { new: true }
  )
    .orFail(new NotFoundError("Карточка не найдена"))
    .then((card) => {
      if (!card) {
        throw new NotFoundError("Карточка не найдена");
      }
      res.send({ data: card });
    })
    .catch((error) => {
      if (error instanceof NotFoundError) {
        next(new NotFoundError(error.message));
      }
      if (error instanceof MongooseError.CastError) {
        next(new BadRequesetError("Некорректный ИД карточки"));
      }
      next(error);
    });
};
