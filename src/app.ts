// app.ts — входной файл
import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import { errors } from 'celebrate';
import { AuthContext } from './types/types';
import { errorHandler } from './middleware/error-handler';
import usersRouter from './routes/users';
import cardsRouter from './routes/cards';
import { MONGO_URL, PORT } from './constants/constants';
import auth from 'middleware/auth';
import {
  createUser,
  login
} from 'controllers/users';
import {
  requestLogger,
  errorLogger
} from 'middleware/logger';

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

// app.use(
//   (req: Request, res: Response<unknown, AuthContext>, next: NextFunction) => {
//     res.locals.user = {
//       _id: '6654a19c1630a097d459e273', // вставьте сюда _id созданного в предыдущем пункте пользователя
//     };
//     next();
//   },
// );
app.use(requestLogger);
app.post('/signup', createUser);
app.post('/signin', login);

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
