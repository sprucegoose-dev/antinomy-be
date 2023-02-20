import { ActionType, IActionPayload } from '../actions/actions.interface';
import { Color } from '../card-type/card_type.interface';
import { Card } from '../models/card.model';
import { IGameState } from './game.interface';

export class GameService {

    create(): IGameState {
        return null;
    }

    performAction(userId: number, payload: IActionPayload): IGameState {
        // retrieve cards

        switch (payload.type) {
            case ActionType.MOVE:
                this.handleMove(payload);
                break;
            case ActionType.MOVE:
                this.handleDeploy(payload);
                break;
            case ActionType.MOVE:
                this.handleReplace(payload);
                break;
        }
        return null;
    }

    handleMove(payload: IActionPayload) {

    }

    handleDeploy(payload: IActionPayload) {

    }

    handleReplace(payload: IActionPayload) {

    }

    hasSet(cardsInHand: Card[], codexColor: Color): boolean {
        const matches = {};

        for (const card of cardsInHand) {
            if (card.type.color === codexColor) {
                continue;
            }

            if (matches[card.type.color]) {
                matches[card.type.color] += 1;
            } else {
                matches[card.type.color] = 1;
            }

            if (matches[card.type.suit]) {
                matches[card.type.suit] += 1;
            } else {
                matches[card.type.suit] = 1;
            }

            if (matches[`${card.type.value}`]) {
                matches[`${card.type.value}`] += 1;
            } else {
                matches[`${card.type.value}`] = 1;
            }
        }

        return Object.values(matches).includes(3);
    }
}
