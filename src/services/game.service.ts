import { Op } from 'sequelize';
import shuffle from 'lodash.shuffle';

import { Card } from '../models/card.model';
import { CardType } from '../models/card_type.model';
import { Game } from '../models/game.model';
import { Player } from '../models/player.model';
import { ActionType, IActionPayload } from '../types/action.interface';
import { Color } from '../types/card_type.interface';
import { GamePhase, GameState, ICombatData, IGameState } from '../types/game.interface';
import CardService from './card.service';
import { PlayerOrientation } from '../types/player.interface';
import {
    CustomException,
    ERROR_BAD_REQUEST,
    ERROR_FORBIDDEN,
    ERROR_NOT_FOUND,
} from '../helpers/exception_handler';
import { ActionService } from './action.service';

class GameService {

    static async create(userId: number): Promise<Game> {
        return await Game.create({
            creatorId: userId,
        });
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

    static async handleMove(player: Player, payload: IActionPayload) {
        const game = await this.getState(player.gameId);
        const continuumCard = game.cards.find(c => c.index === payload.targetIndex);
        const codexColor =  game.codexColor;
        const opponent =  game.players.find(p => p.id !== player.id);
        const playerCards = [...game.cards.filter(c =>
            c.playerId === player.id && c.id !== payload.sourceCardId
        ), continuumCard];
        const opponentCards = game.cards.filter(c =>
            c.playerId  && c.playerId !== player.id
        );

        // update player position
        player.position = payload.targetIndex;
        await player.save();

        // swap the card from the player's hand with the continuum card at the target index
        await GameService.swapCards(
            player.id,
            payload.sourceCardId,
            continuumCard.id,
            continuumCard.index,
        );

        // resolve combat if applicable
        if (payload.targetIndex === opponent.position) {
            await GameService.resolveCombat({
                game,
                player,
                opponent,
                playerCards,
                opponentCards,
            });
        }

        // check if the player has formed a set (i.e. 'paradox')
        if (GameService.hasSet(playerCards, codexColor)) {
            await GameService.resolveParadox(game, player);
        }

        // go to the next player
        game.activePlayerId = opponent.id;

        await game.save();
    }

    static async handleReplace(player: Player, payload: IActionPayload): Promise<void> {
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

    static async getActions(userId: number, gameId: number): Promise<IActionPayload[]> {
        const game = await this.getState(gameId);
        let actions: IActionPayload[] = [];

        const activePlayer = game.players.find(p =>
            p.id === game.activePlayerId && p.userId === userId
        );

        if (!activePlayer) {
            return actions;
        }

        const continiuumCards = game.cards.filter(c => c.index !== null);

        const playerCards = game.cards.filter(c => c.playerId === activePlayer.id);

        switch (game.phase) {
            case GamePhase.DEPLOYMENT:
                actions = ActionService.getDeployActions(game.codexColor, continiuumCards);
                break;
            case GamePhase.REPLACEMENT:
                actions = ActionService.getReplaceActions(activePlayer, continiuumCards);
                break;
            case GamePhase.MOVEMENT:
                actions = ActionService.getMoveActions(activePlayer, playerCards, continiuumCards);
                break;
        }

        return actions;
    }

    static async getActiveGames(): Promise<Omit<IGameState, 'cards'>[]> {
        return await Game.findAll({
            where: {
                state: {
                    [Op.not]: GameState.ENDED,
                },
            },
            include: [
                {
                    model: Player,
                    as: 'players',
                },
            ]
        });
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

    static async getState(gameId: number): Promise<IGameState> {
        return await Game.findOne({
            where: {
                id: gameId,
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
        });
    }

    static async performAction(userId: number, gameId: number, payload: IActionPayload): Promise<void> {
        // validate action

        const game = await Game.findOne({
            where: {
                id: gameId,
            },
            include: [
                {
                    model: Player,
                    as: 'players'
                },
            ]
        });

        if (!game) {
            throw new CustomException(ERROR_NOT_FOUND, 'Game not found');
        }

        const activePlayer = game.players.find(p =>
            p.id === game.activePlayerId && p.userId === userId
        );

        if (!activePlayer) {
            throw new CustomException(ERROR_BAD_REQUEST, 'You are not the active player');
        }

        switch (payload.type) {
            case ActionType.MOVE:
                await GameService.handleMove(activePlayer, payload);
                break;
            case ActionType.MOVE:
                await GameService.handleDeploy(activePlayer, payload);
                break;
            case ActionType.MOVE:
                await GameService.handleReplace(activePlayer, payload);
                break;
        }
    }

    static async resolveCombat({
        game,
        player,
        opponent,
        playerCards,
        opponentCards,
    }: ICombatData) {
        let totalValue = 0;
        let opponentTotalValue = 0;
        let validPlayerCards = shuffle(playerCards.filter(c => c.type.color !== game.codexColor));
        let validOpponentCards = shuffle(opponentCards.filter(c => c.type.color !== game.codexColor));
        let winner;
        let loser;

        for (const card of validPlayerCards) {
            totalValue += card.type.value;
        }

        for (const card of validOpponentCards) {
            opponentTotalValue += card.type.value;
        }

        // The winner is the player with the higher total card value
        if (totalValue > opponentTotalValue) {
            winner = player;
            loser = opponent;
        } else if (opponentTotalValue > totalValue) {
            winner = opponent;
            loser = player;
        } else {
            // In case of a tie, compare the shuffled cards one at a time
            for (let i = 0; i < 3; i++) {
                const cardValue = validPlayerCards[i].type.value;
                const opponentCardValue = validOpponentCards[i].type.value;

                if (cardValue > opponentCardValue) {
                    winner = player;
                    loser = opponent;
                    break;
                } else if (opponentCardValue > cardValue) {
                    winner = opponent;
                    loser = player;
                    break;
                }
            }
        }

        if (loser?.points) {
            await GameService.resolveParadox(game, winner, loser);
        }
    }

    static async resolveParadox(game: Game, player: Player, opponent?: Player) {
        // award player a point
        const playerPoints = player.points + 1;

        await Player.update({
            points: playerPoints,
        }, {
            where: {
               id: player.id
            },
        });

        // deduct a point from opponent (only happens in combat)
        if (opponent) {
            await Player.update({
                points: opponent.points - 1,
            }, {
                    where: {
                    id: opponent.id
                },
            });
        }

        // advance the codex color clockwise
        game.codexColor = GameService.getNextCodeColor(game.codexColor);

        // check victory condition
        if (playerPoints === 5) {
            game.winnerId === player.userId;
            game.state === GameState.ENDED;
        }

        await game.save();
    }

    static async start(userId: number, gameId: number): Promise<void> {
        const game = await Game.findOne({
            where: {
                id: gameId,
            },
            include: [
                {
                    model: Player,
                    as: 'players',
                }
            ]
        });

        if (game.creatorId !== userId) {
            throw new CustomException(ERROR_FORBIDDEN, 'Only the game creator can start the game');
        }

        const players = game.players;

        if (players.length !== 2) {
            throw new CustomException(ERROR_BAD_REQUEST, 'The game must have two players');
        }

        const cardTypes = shuffle(await CardType.findAll());

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

        const startingPlayerId = shuffle(players)[0].id;

        await Player.update({
            orientation: PlayerOrientation.BOTTOM,
        }, {
            where: {
                gameId,
                id: startingPlayerId,
            }
        });

        await Player.update({
            orientation: PlayerOrientation.TOP,
        }, {
            where: {
                gameId,
                id: {
                    [Op.not]: startingPlayerId
                },
            }
        });

        await Game.update(
            {
                activePlayerId: startingPlayerId,
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
}

export default GameService;
