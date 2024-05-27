// models/user.ts
import mongoose from "mongoose";

interface ICard {
  name: string;
  link: string;
  owner: string;
  likes: string;
  createdAt: string;
}

const cardSchema = new mongoose.Schema<ICard>({
  name: { // у пользователя есть имя — опишем требования к имени в схеме:
    type: String, // имя — это строка
    required: true, // имя — обязательное поле
    minlength: 2,
    maxlength: 30,
  },
  about: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 200,
  },
  avatar: {
    String,
    required: true,
  }
});