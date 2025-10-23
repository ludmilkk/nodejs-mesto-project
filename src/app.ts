import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { errors } from 'celebrate';
import router from './routes';
import { createUser, login } from './controllers/users';
import auth from './middlewares/auth';
import { requestLogger, errorLogger } from './middlewares/logger';
import errorHandler from './middlewares/errorHandler';
import { validateSignup, validateSignin } from './middlewares/validation';
import HttpStatus from './types/httpStatus';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

// Логирование запросов
app.use(requestLogger);

// Роуты регистрации и авторизации
app.post('/signin', validateSignin, login);
app.post('/signup', validateSignup, createUser);

// Защита всех остальных роутов
app.use(auth);

// Подключение защищенных роутов
app.use(router);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Логирование ошибок
app.use(errorLogger);

// Обработка ошибок
app.use(errors());

// Централизованная обработка ошибок
app.use(errorHandler);

// Обработка несуществующих роутов
app.use('*', (req, res) => {
  res.status(HttpStatus.NOT_FOUND).json({ message: 'Запрашиваемый ресурс не найден' });
});

// Подключение к MongoDB и запуск сервера
const start = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/mestodb');
    console.log('Подключено к MongoDB');

    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  } catch (error) {
    console.error('Ошибка подключения к MongoDB:', error);
    process.exit(1);
  }
};

start();
