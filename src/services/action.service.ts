import { Card } from '../models/card.model';
import { Player } from '../models/player.model';
import { ActionType, IActionPayload } from '../types/action.interface';
import { PlayerOrientation } from '../types/player.interface';

export class ActionService {

    static getMoveActions(player: Player, cardsInHand: Card[], continuumCards: Card[]): IActionPayload[] {
        const {
            position: playerPosition,
            orientation,
        } = player;

        let actions: IActionPayload[] = [];

        if (orientation === PlayerOrientation.TOP) {
            continuumCards.reverse();
        }

        const cardsInPast = continuumCards.slice(0, playerPosition);
        const cardsInFuture = continuumCards.slice(playerPosition);

        for (const card of cardsInHand) {
            actions = actions.concat(this.getValidMoveTargets(card, cardsInPast, cardsInFuture));
        }

        return actions;
    }

    static getValidMoveTargets(cardInHand: Card, cardsInPast: Card[], cardsInFuture: Card[]): IActionPayload[] {
        const actions = [];

        for (const card of cardsInPast) {
            if (cardInHand.type.suit === card.type.suit || cardInHand.type.color === card.type.color) {
                actions.push({
                    sourceCardId: cardInHand.id,
                    targetIndex: card.index,
                    type: ActionType.MOVE,
                })
            }
        }

        const cardInFuture = cardsInFuture[cardInHand.type.value];

        if (cardInFuture) {
            actions.push({
                sourceCardId: cardInHand.id,
                targetIndex: cardInFuture.index,
                type: ActionType.MOVE,
            })
        }

        return actions;
    }
}
