import { Request, Response } from 'express';
import Card from '../models/card';
import { IUser } from '../models/user';
import HttpStatus from '../types/httpStatus';

export const getCards = async (req: Request, res: Response) => {
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
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
  }
};

export const createCard = async (req: Request, res: Response) => {
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
  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(HttpStatus.BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании карточки' });
    }
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
  }
};

export const deleteCard = async (req: Request, res: Response) => {
  try {
    const { cardId } = req.params;

    if (!cardId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(HttpStatus.BAD_REQUEST).send({ message: 'Некорректный _id карточки' });
    }

    const card = await Card.findByIdAndDelete(cardId);

    if (!card) {
      return res.status(HttpStatus.NOT_FOUND).send({ message: 'Карточка не найдена' });
    }

    return res.send({ message: 'Карточка удалена' });
  } catch (error) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
  }
};

export const likeCard = async (req: Request, res: Response) => {
  try {
    const { cardId } = req.params;
    const userId = req.user?._id;

    if (!cardId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(HttpStatus.BAD_REQUEST).send({ message: 'Некорректный _id карточки' });
    }

    const card = await Card.findByIdAndUpdate(
      cardId,
      { $addToSet: { likes: userId } },
      { new: true },
    );

    if (!card) {
      return res.status(HttpStatus.NOT_FOUND).send({ message: 'Карточка не найдена' });
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
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
  }
};

export const dislikeCard = async (req: Request, res: Response) => {
  try {
    const { cardId } = req.params;
    const userId = req.user?._id;

    if (!cardId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(HttpStatus.BAD_REQUEST).send({ message: 'Некорректный _id карточки' });
    }

    const card = await Card.findByIdAndUpdate(
      cardId,
      { $pull: { likes: userId } },
      { new: true },
    );

    if (!card) {
      return res.status(HttpStatus.NOT_FOUND).send({ message: 'Карточка не найдена' });
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
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
  }
};
