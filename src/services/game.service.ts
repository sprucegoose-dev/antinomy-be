import { Op } from 'sequelize';
import { Card } from '../models/card.model';
import { Game } from '../models/game.model';
import { Player } from '../models/player.model';
import { ActionType, IActionPayload } from '../types/action.interface';
import { Color } from '../types/card_type.interface';
import { GameState, IGameState } from '../types/game.interface';

class GameService {

    static async create(userId: number): Promise<Game> {
        return await Game.create({
            creatorId: userId,
        });
    }

    performAction(_userId: number, payload: IActionPayload): IGameState {
        // ensure user is active player
        // retrieve cards
        // validate action

        switch (payload.type) {
            case ActionType.MOVE:
                GameService.handleMove(payload);
                break;
            case ActionType.MOVE:
                GameService.handleDeploy(null, payload);
                break;
            case ActionType.MOVE:
                GameService.handleReplace(payload);
                break;
        }
        return null;
    }

    static async handleMove(_payload: IActionPayload) {
        // update player position

        // add card from player\'s hand to the continuum

        // add card from the continuum to player's hand

        // initiate combat if applicable

        // check if paradox has formed

        // advance the code

        // go to the next player
    }

    static async handleDeploy(player: Player, payload: IActionPayload): Promise<void> {
        // assign position to player
        await Player.update({
            position: payload.targetIndex,
        }, {
            where: {
                id: player.id,
            }
        });

        const deployedPlayers = await Player.findAll({
            where: {
                gameId: player.gameId,
                position: {
                    [Op.not]: null,
                }
            }
        });

        // if both players have positioned themselves, start the game
        if (deployedPlayers.length === 2) {
            await Game.update({
                state: GameState.STARTED,
            }, {
                where: {
                    id: player.gameId,
                }
            });
        }
    }

    static async handleReplace(_payload: IActionPayload) {
        // add 3 cards to player's hand

        // place 3 cards from player's hand in the continuum
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
