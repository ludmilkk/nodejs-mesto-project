import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import router from './routes';
import HttpStatus from './types/httpStatus';

const app = express();
const PORT = 3000;

app.use(express.json());

// Временное решение авторизации
app.use((req: Request, res: Response, next: NextFunction) => {
  req.user = {
    _id: '68f66fb5ee3f14282a5459cc',
  };
  next();
});

// Подключение роутов
app.use(router);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

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
