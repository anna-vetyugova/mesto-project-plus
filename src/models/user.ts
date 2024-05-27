import mongoose from 'mongoose';
import validator from 'validator';

interface IUser {
  name: string;
  about: string;
  avatar: string;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Поле "name" должно быть заполнено'],
      minlength: [2, 'Минимальная длина поля "name" - 2'],
      maxlength: [30, 'Максимальная длина поля "name" - 30'],
    },
    about: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 200,
    },
    avatar: {
      type: String,
      validate: {
        validator: (v: string) => validator.isURL(v),
        message: 'Некорректный URL',
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// создаём модель и экспортируем её
export default mongoose.model<IUser>('user', userSchema);
