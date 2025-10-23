import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import HttpStatus from '../types/httpStatus';
import BadRequestError from '../errors/BadRequestError';
import NotFoundError from '../errors/NotFoundError';
import UnauthorizedError from '../errors/UnauthorizedError';
import ConflictError from '../errors/ConflictError';

const JWT_SECRET = 'dev-secret-key';

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find({});
    const formattedUsers = users.map((user) => ({
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      _id: user._id,
    }));
    return res.send(formattedUsers);
  } catch (error) {
    return next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestError('Некорректный _id пользователя');
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    const formattedUser = {
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      _id: user._id,
    };

    return res.send(formattedUser);
  } catch (error) {
    return next(error);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;

    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    const formattedUser = {
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      email: user.email,
      _id: user._id,
    };

    return res.send(formattedUser);
  } catch (error) {
    return next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name, about, avatar, email, password,
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      about,
      avatar,
      email,
      password: hashedPassword,
    });

    const savedUser = await user.save();
    const formattedUser = {
      name: savedUser.name,
      about: savedUser.about,
      avatar: savedUser.avatar,
      email: savedUser.email,
      _id: savedUser._id,
    };
    return res.status(HttpStatus.CREATED).send(formattedUser);
  } catch (error: any) {
    if (error.code === 11000) {
      return next(new ConflictError('Пользователь с таким email уже существует'));
    }
    if (error.name === 'ValidationError') {
      return next(new BadRequestError('Переданы некорректные данные при создании пользователя'));
    }
    return next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, about } = req.body;
    const userId = req.user?._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, about },
      { new: true, runValidators: true },
    );

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    const formattedUser = {
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      _id: user._id,
    };

    return res.send(formattedUser);
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
    }
    return next(error);
  }
};

export const updateAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { avatar } = req.body;
    const userId = req.user?._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { avatar },
      { new: true, runValidators: true },
    );

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    const formattedUser = {
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      _id: user._id,
    };

    return res.send(formattedUser);
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return next(new BadRequestError('Переданы некорректные данные при обновлении аватара'));
    }
    return next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new UnauthorizedError('Неправильные почта или пароль');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Неправильные почта или пароль');
    }

    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('jwt', token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
      httpOnly: true,
    });

    return res.send({ message: 'Успешная авторизация' });
  } catch (error) {
    return next(error);
  }
};
