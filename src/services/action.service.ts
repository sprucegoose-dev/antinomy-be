import { Card } from '../models/card.model';
import { Player } from '../models/player.model';
import { ActionType, IActionPayload } from '../types/action.interface';
import { Color } from '../types/card_type.interface';
import { PlayerOrientation } from '../types/player.interface';

export class ActionService {

    static getDeployAction(codexColor: Color, continuumCards: Card[]): IActionPayload[] {
        let actions: IActionPayload[] = [];

        for (const card of continuumCards) {
            if (card.type.color === codexColor) {
                actions.push({
                    targetIndex: card.index,
                    type: ActionType.DEPLOY,
                });
            }
        }

        return actions;
    }

    static getMoveActions(player: Player, cardsInHand: Card[], continuumCards: Card[]): IActionPayload[] {
        let actions: IActionPayload[] = [];
        const {
            cardsInPast,
            cardsInFuture,
        } = this.getPastAndFutureCards(player, continuumCards);

        for (const card of cardsInHand) {
            actions = actions.concat(this.getValidMoveTargets(card, cardsInPast, cardsInFuture));
        }

        return actions;
    }

    static getPastAndFutureCards(player: Player, continuumCards: Card[]): { cardsInPast: Card[], cardsInFuture: Card[] } {
        const {
            position: playerPosition,
            orientation,
        } = player;

        if (orientation === PlayerOrientation.TOP) {
            continuumCards.reverse();
        }

        return {
            cardsInPast: continuumCards.slice(0, playerPosition),
            cardsInFuture: continuumCards.slice(playerPosition),
        };
    }

    static getReplaceAction(player: Player, continuumCards: Card[]): IActionPayload[] {
        let actions: IActionPayload[] = [];
        const {
            cardsInPast,
            cardsInFuture,
        } = this.getPastAndFutureCards(player, continuumCards);

        if (cardsInPast.length >= 3) {
            actions.push({
                targetIndex: cardsInPast[cardsInPast.length - 1].index,
                type: ActionType.REPLACE,
            });
        }

        if (cardsInFuture.length >= 3) {
            actions.push({
                targetIndex: cardsInFuture[0].index,
                type: ActionType.REPLACE,
            });
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
                });
            }
        }

        const cardInFuture = cardsInFuture[cardInHand.type.value];

        if (cardInFuture) {
            actions.push({
                sourceCardId: cardInHand.id,
                targetIndex: cardInFuture.index,
                type: ActionType.MOVE,
            });
        }

        return actions;
    }
}
