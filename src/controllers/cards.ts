import { Request, Response, NextFunction } from 'express';
import Card from '../models/card';
import { IUser } from '../models/user';
import HttpStatus from '../types/httpStatus';
import BadRequestError from '../errors/BadRequestError';
import NotFoundError from '../errors/NotFoundError';
import ForbiddenError from '../errors/ForbiddenError';

export const getCards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cards = await Card.find({}).populate('owner');
    const formattedCards = cards.map((card) => {
      const owner = card.owner as unknown as IUser;
      return {
        name: card.name,
        link: card.link,
        owner: {
          name: owner.name,
          about: owner.about,
          avatar: owner.avatar,
          _id: owner._id,
        },
        likes: card.likes,
        _id: card._id,
        createdAt: card.createdAt,
      };
    });
    return res.send(formattedCards);
  } catch (error) {
    return next(error);
  }
};

export const createCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, link } = req.body;

    const card = new Card({
      name,
      link,
      owner: req.user?._id,
    });

    const savedCard = await card.save();
    const formattedCard = {
      name: savedCard.name,
      link: savedCard.link,
      owner: savedCard.owner,
      likes: savedCard.likes,
      _id: savedCard._id,
      createdAt: savedCard.createdAt,
    };
    return res.status(HttpStatus.CREATED).send(formattedCard);
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return next(new BadRequestError('Переданы некорректные данные при создании карточки'));
    }
    return next(error);
  }
};

export const deleteCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cardId } = req.params;
    const userId = req.user?._id;

    if (!cardId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestError('Некорректный _id карточки');
    }

    const card = await Card.findById(cardId);

    if (!card) {
      throw new NotFoundError('Карточка не найдена');
    }

    if (card.owner.toString() !== userId) {
      throw new ForbiddenError('Нельзя удалить карточку другого пользователя');
    }

    await Card.findByIdAndDelete(cardId);

    return res.send({ message: 'Карточка удалена' });
  } catch (error) {
    return next(error);
  }
};

export const likeCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cardId } = req.params;
    const userId = req.user?._id;

    if (!cardId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestError('Некорректный _id карточки');
    }

    const card = await Card.findByIdAndUpdate(
      cardId,
      { $addToSet: { likes: userId } },
      { new: true },
    );

    if (!card) {
      throw new NotFoundError('Карточка не найдена');
    }

    const formattedCard = {
      name: card.name,
      link: card.link,
      owner: card.owner,
      likes: card.likes,
      _id: card._id,
      createdAt: card.createdAt,
    };

    return res.send(formattedCard);
  } catch (error) {
    return next(error);
  }
};

export const dislikeCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cardId } = req.params;
    const userId = req.user?._id;

    if (!cardId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new BadRequestError('Некорректный _id карточки');
    }

    const card = await Card.findByIdAndUpdate(
      cardId,
      { $pull: { likes: userId } },
      { new: true },
    );

    if (!card) {
      throw new NotFoundError('Карточка не найдена');
    }

    const formattedCard = {
      name: card.name,
      link: card.link,
      owner: card.owner,
      likes: card.likes,
      _id: card._id,
      createdAt: card.createdAt,
    };

    return res.send(formattedCard);
  } catch (error) {
    return next(error);
  }
};
