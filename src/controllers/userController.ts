import { Request, Response } from 'express';
import User from '../models/user';
import HttpStatus from '../types/httpStatus';

export const getUsers = async (req: Request, res: Response) => {
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
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(HttpStatus.BAD_REQUEST).send({ message: 'Некорректный _id пользователя' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).send({ message: 'Пользователь не найден' });
    }

    const formattedUser = {
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      _id: user._id,
    };

    return res.send(formattedUser);
  } catch (error) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, about, avatar } = req.body;

    const user = new User({
      name,
      about,
      avatar,
    });

    const savedUser = await user.save();
    const formattedUser = {
      name: savedUser.name,
      about: savedUser.about,
      avatar: savedUser.avatar,
      _id: savedUser._id,
    };
    return res.status(HttpStatus.CREATED).send(formattedUser);
  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(HttpStatus.BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании пользователя' });
    }
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { name, about } = req.body;
    const userId = req.user?._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, about },
      { new: true, runValidators: true },
    );

    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).send({ message: 'Пользователь не найден' });
    }

    const formattedUser = {
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      _id: user._id,
    };

    return res.send(formattedUser);
  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(HttpStatus.BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении профиля' });
    }
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
  }
};

export const updateAvatar = async (req: Request, res: Response) => {
  try {
    const { avatar } = req.body;
    const userId = req.user?._id;

    const user = await User.findByIdAndUpdate(
      userId,
      { avatar },
      { new: true, runValidators: true },
    );

    if (!user) {
      return res.status(HttpStatus.NOT_FOUND).send({ message: 'Пользователь не найден' });
    }

    const formattedUser = {
      name: user.name,
      about: user.about,
      avatar: user.avatar,
      _id: user._id,
    };

    return res.send(formattedUser);
  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(HttpStatus.BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении аватара' });
    }
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
  }
};
