import { Op } from 'sequelize';
import shuffle from 'lodash.shuffle';

import { Card } from '../models/card.model';
import { CardType } from '../models/card_type.model';
import { Game } from '../models/game.model';
import { Player } from '../models/player.model';
import { ActionType, IActionPayload } from '../types/action.interface';
import { Color } from '../types/card_type.interface';
import { GameState, IGameState } from '../types/game.interface';
import CardService from './card.service';
import { IPlayer } from '../types/player.interface';


class GameService {

    static async create(userId: number): Promise<Game> {
        return await Game.create({
            creatorId: userId,
        });
    }

    static async start(gameId: number): Promise<void> {
        const cardTypes = shuffle(await CardType.findAll());
        const players = await Player.findAll({
            where: {
                gameId,
            }
        })

        let codexColor: Color;

        for (let i = 0; i < cardTypes.length; i++) {
            let cardType = cardTypes[i];

            if (i < 9) {
                // deal continuum cards
                await CardService.create({
                    cardTypeId: cardType.id,
                    gameId,
                    index: i,
                });

                if (i === 8) {
                    // assign starting codex based on last card in continuum
                    codexColor = cardType.color;
                }
            } else if (i < cardTypes.length - 1) {
                // deal cards to players
                await CardService.create({
                    cardTypeId: cardType.id,
                    playerId: players[i < 12 ? 0 : 1].id,
                    gameId,
                });
            } else {
                // leave the last card to be the codex
                await CardService.create({
                    cardTypeId: cardType.id,
                    gameId,
                });
            }
        }

        await Game.update(
            {
                activePlayerId: shuffle(players)[0].id,
                codexColor,
                state: GameState.SETUP,
            },
            {
                where: {
                    id: gameId,
                }
            }
        );
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
                GameService.handleReplace(null, payload);
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

    static async handleReplace(player: IPlayer, payload: IActionPayload): Promise<void> {
        const cards = await Card.findAll({
            where: {
                gameId: player.gameId,
            }
        });

        const continuumCards = [];
        let playerCards = [];

        for (const card of cards) {
            if (card.index !== null) {
                continuumCards.push(card.toJSON());
            }

            if (card.playerId === player.id) {
                playerCards.push(card.toJSON());
            }
        }

        const cardsToPickUp = player.position < payload.targetIndex ?
            continuumCards.slice(payload.targetIndex, payload.targetIndex + 3) :
            continuumCards.slice(payload.targetIndex - 3, payload.targetIndex);

        playerCards = shuffle(playerCards);

        for (let i = 0; i < cardsToPickUp.length; i++) {

            await Card.update({
                index: null,
                playerId: player.id,
            }, {
                where: {
                    id: cardsToPickUp[i].id,
                }
            });

            await Card.update({
                index: cardsToPickUp[i].index,
                playerId: null,
            }, {
                where: {
                    id: playerCards[i].id,
                }
            });
        }
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
