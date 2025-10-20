import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes';
import cardRoutes from './routes/cardRoutes';

const app = express();
const PORT = 3000;

app.use(express.json());

// Временное решение авторизации
app.use((req: Request, res: Response, next: NextFunction) => {
  (req as any).user = {
    _id: '68f66fb5ee3f14282a5459cc',
  };
  next();
});

// Подключение к MongoDB
mongoose.connect('mongodb://localhost:27017/mestodb')
  .then(() => {
    console.log('Подключено к MongoDB');
  })
  .catch((error) => {
    console.error('Ошибка подключения к MongoDB:', error);
  });

// Подключение роутов
app.use('/users', userRoutes);
app.use('/cards', cardRoutes);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Обработка несуществующих роутов
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Запрашиваемый ресурс не найден' });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
