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
                GameService.handleMove(null, payload);
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

    static async handleMove(player: IPlayer, payload: IActionPayload) {
        let playerPoints = player.points;

        // update player position
        await Player.update({
            position: payload.targetIndex,
        }, {
            where: {
               id: player.id
            },
        });

        const game = await Game.findOne({
            where: {
                id: player.gameId,
            },
            include: [
                {
                    model: Player,
                    as: 'players',
                },
                {
                    model: Card,
                    include: [
                        CardType,
                    ],
                }
            ]
        })

        const continuumCard = game.cards.find(c => c.index === payload.targetIndex);

        // swap card from the player's hand with a continuum card
        await GameService.swapCards(
            player.id,
            payload.sourceCardId,
            continuumCard.id,
            continuumCard.index,
        );

        const playerCards = [...game.cards.filter(c =>
            c.playerId === player.id && c.id !== payload.sourceCardId
        ), continuumCard];

        // const opponentCards = game.cards.filter(c =>
        //     c.playerId  && c.playerId !== player.id
        // );

        // resolve combat if applicable

        // check if played has a set (i.e. 'paradox')
        if (GameService.hasSet(playerCards, game.codexColor)) {
            playerPoints++;

            // advance the codex color clockwise
            game.codexColor = GameService.getNextCodeColor(game.codexColor);

            // award player a point
            await Player.update({
                points: playerPoints,
            }, {
                where: {
                   id: player.id
                },
            });

            // check victory condition
            if (playerPoints === 5) {
                game.state === GameState.ENDED;
                game.winnerId === player.userId;
            }
        }

        // go to the next player
        game.activePlayerId = game.players.find(p => p.id !== player.id).id;

        await game.save();
    }

    static getNextCodeColor(currentColor: Color): Color {
        const colors = Object.values(Color);
        const currentIndex = colors.indexOf(currentColor);
        let nextIndex = currentIndex - 1;

        if (nextIndex === -1) {
            nextIndex = colors.length - 1;
        }

        return colors[nextIndex];
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

    static async swapCards(playerId: number, sourceCardId: number, continuumCardId: number, targetIndex: number) {
        await Card.update({
            index: null,
            playerId,
        }, {
            where: {
                id: continuumCardId,
            }
        });

        await Card.update({
            index: targetIndex,
            playerId: null,
        }, {
            where: {
                id: sourceCardId,
            }
        });
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
            await GameService.swapCards(
                player.id,
                playerCards[i].id,
                cardsToPickUp[i].id,
                cardsToPickUp[i].index
            );
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
