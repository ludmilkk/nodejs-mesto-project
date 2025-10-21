import { Request, Response } from 'express';
import Card from '../models/card';

export const getCards = async (req: Request, res: Response) => {
  try {
    const cards = await Card.find({}).populate('owner');
    const formattedCards = cards.map((card) => ({
      name: card.name,
      link: card.link,
      owner: {
        name: (card.owner as any).name,
        about: (card.owner as any).about,
        avatar: (card.owner as any).avatar,
        _id: (card.owner as any)._id,
      },
      likes: card.likes,
      _id: card._id,
      createdAt: card.createdAt,
    }));
    return res.send(formattedCards);
  } catch (error) {
    return res.status(500).send({ message: 'На сервере произошла ошибка' });
  }
};

export const createCard = async (req: Request, res: Response) => {
  try {
    const { name, link } = req.body;

    const card = new Card({
      name,
      link,
      owner: (req as any).user?._id,
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
    return res.status(201).send(formattedCard);
  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(400).send({ message: 'Переданы некорректные данные при создании карточки' });
    }
    return res.status(500).send({ message: 'На сервере произошла ошибка' });
  }
};

export const deleteCard = async (req: Request, res: Response) => {
  try {
    const { cardId } = req.params;

    if (!cardId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({ message: 'Некорректный _id карточки' });
    }

    const card = await Card.findByIdAndDelete(cardId);

    if (!card) {
      return res.status(404).send({ message: 'Карточка не найдена' });
    }

    return res.send({ message: 'Карточка удалена' });
  } catch (error) {
    return res.status(500).send({ message: 'На сервере произошла ошибка' });
  }
};

export const likeCard = async (req: Request, res: Response) => {
  try {
    const { cardId } = req.params;
    const userId = (req as any).user?._id;

    if (!cardId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({ message: 'Некорректный _id карточки' });
    }

    const card = await Card.findByIdAndUpdate(
      cardId,
      { $addToSet: { likes: userId } },
      { new: true },
    );

    if (!card) {
      return res.status(404).send({ message: 'Карточка не найдена' });
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
    return res.status(500).send({ message: 'На сервере произошла ошибка' });
  }
};

export const dislikeCard = async (req: Request, res: Response) => {
  try {
    const { cardId } = req.params;
    const userId = (req as any).user?._id;

    if (!cardId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send({ message: 'Некорректный _id карточки' });
    }

    const card = await Card.findByIdAndUpdate(
      cardId,
      { $pull: { likes: userId } },
      { new: true },
    );

    if (!card) {
      return res.status(404).send({ message: 'Карточка не найдена' });
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
    return res.status(500).send({ message: 'На сервере произошла ошибка' });
  }
};
