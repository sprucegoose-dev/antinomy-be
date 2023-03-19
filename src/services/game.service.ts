import { Card } from '../models/card.model';
import { ActionType, IActionPayload } from '../types/action.interface';
import { Color } from '../types/card_type.interface';
import { IGameState } from '../types/game.interface';

class GameService {

    create(): IGameState {
        return null;
    }

    performAction(_userId: number, payload: IActionPayload): IGameState {
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

    handleMove(_payload: IActionPayload) {

    }

    handleDeploy(_payload: IActionPayload) {

    }

    handleReplace(_payload: IActionPayload) {

    }

    static hasSet(cardsInHand: Card[], codexColor: Color): boolean {
        const matches: {[key: string]: number }= {};

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

export default GameService;
