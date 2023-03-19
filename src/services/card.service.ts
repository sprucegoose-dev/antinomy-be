
import { Card } from '../models/card.model';
import { CardType } from '../models/card_type.model';
import { ICard } from '../types/card.interface';

class CardService {

    static async create({
        cardTypeId,
        playerId = null,
        gameId = null,
        index = null,
    }: ICard): Promise<Card> {
        const card = await Card.create({
            playerId,
            gameId,
            index,
            cardTypeId,
        });

        return await Card.findOne({
            where: {
                id: card.id,
            },
            include: [
                CardType,
            ]
        });
    }
}

export default CardService;

