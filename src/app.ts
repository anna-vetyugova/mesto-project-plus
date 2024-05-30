import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import { errors, Joi, celebrate } from 'celebrate';
import {
  createUser,
  login,
} from './controllers/users';
import {
  requestLogger,
  errorLogger,
} from './middleware/logger';
import auth from './middleware/auth';
import { errorHandler } from './middleware/error-handler';
import usersRouter from './routes/users';
import cardsRouter from './routes/cards';

const { MONGO_URL = 'mongodb://localhost:27017/mestodb', PORT = 3000 } = process.env;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

// подключаемся к серверу MongoiDB
mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log('Подключение к БД MongoDB выполнено успешно');
  })
  .catch((err) => {
    console.log(err);
  });

app.use(requestLogger);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(200),
    avatar: Joi.string().uri(),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
  }),
}), createUser);
app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
  }),
}), login);

app.use(auth);
// подключаем мидлвары, роуты и всё остальное...
app.use(usersRouter);
app.use(cardsRouter);

app.use('*', (req, res) => {
  res.status(404).json({ message: 'Запрашиваемый ресурс не найден' });
});

app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
