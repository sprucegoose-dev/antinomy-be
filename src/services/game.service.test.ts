import { Op } from 'sequelize';
import { Card } from '../models/card.model';
import { CardType } from '../models/card_type.model';
import { Game } from '../models/game.model';
import { Player } from '../models/player.model';
import { User } from '../models/user.model';
import { ActionType, IActionPayload } from '../types/action.interface';
import { Color, Suit } from '../types/card_type.interface';
import { GameState } from '../types/game.interface';
import CardService from './card.service';
import GameService from './game.service';
import PlayerService from './player.service';
import UserService from './user.service';

describe('GameService', () => {
    const userDataA = {
        username: 'SpruceGoose',
        email: 'spruce.goose@gmail.com',
        password: 'alrighty.then',
    };
    const userDataB = {
        username: 'VioleTide',
        email: 'violet.tide@gmail.com',
        password: 'animaniacs',
    };
    let userA: User;
    let userB: User;

    beforeAll(async () => {
        userA = await UserService.create(userDataA);
        userB = await UserService.create(userDataB);
    });

    describe('hasSet', () => {

        it('should return \'true\' if 3 cards have the same color, which isn\'t the Codex color', async () => {
            const cardTypes = await CardType.findAll({
                where: {
                    color: Color.RED,
                },
                limit: 3,
            });

            const cards = [];

            for (const cardType of cardTypes) {
                const card = await CardService.create({
                    cardTypeId: cardType.id,
                });

                cards.push(card);
            }

            expect(GameService.hasSet(cards, Color.BLUE)).toBe(true);
        });

        it('should return \'true\' if 3 cards have the same suit, and none have the Codex color', async () => {
            const cardTypes = await CardType.findAll({
                where: {
                    suit: Suit.SKULL,
                    color: {
                        [Op.not]: Color.BLUE,
                    },
                },
                limit: 3,
            });

            const cards = [];

            for (const cardType of cardTypes) {
                const card = await CardService.create({
                    cardTypeId: cardType.id,
                });

                cards.push(card);
            }

            expect(GameService.hasSet(cards, Color.BLUE)).toBe(true);
        });

        it('should return \'true\' if 3 cards have the same number, and none have the Codex color', async () => {
            const cardTypes = await CardType.findAll({
                where: {
                    value: 3,
                    color: {
                        [Op.not]: Color.BLUE,
                    },
                },
                limit: 3,
            });

            const cards = [];

            for (const cardType of cardTypes) {
                const card = await CardService.create({
                    cardTypeId: cardType.id,
                });

                cards.push(card);
            }

            expect(GameService.hasSet(cards, Color.BLUE)).toBe(true);
        });

        it('should return \'false\' if 3 cards have the same color, but it\'s the Codex color', async () => {
            const cardTypes = await CardType.findAll({
                where: {
                    color: Color.RED,
                },
                limit: 3,
            });

            const cards = [];

            for (const cardType of cardTypes) {
                const card = await CardService.create({
                    cardTypeId: cardType.id,
                });

                cards.push(card);
            }

            expect(GameService.hasSet(cards, Color.RED)).toBe(false);
        });

        it('should return \'false\' if 3 cards have the same suit, but at least one is the Codex color', async () => {
            const cardTypes = await CardType.findAll({
                where: {
                    suit: Suit.FEATHER,
                    color: {
                        [Op.in]: [
                            Color.RED,
                            Color.BLUE,
                            Color.GREEN,
                        ]
                    }
                },
                limit: 3,
            });

            const cards = [];

            for (const cardType of cardTypes) {
                const card = await CardService.create({
                    cardTypeId: cardType.id,
                });

                cards.push(card);
            }

            expect(GameService.hasSet(cards, Color.RED)).toBe(false);
        });


        it('should return \'false\' if 3 cards have the same number, but at least one is the Codex color', async () => {
            const cardTypes = await CardType.findAll({
                where: {
                    value: 2,
                    color: {
                        [Op.in]: [
                            Color.RED,
                            Color.BLUE,
                            Color.GREEN,
                        ]
                    }
                },
                limit: 3,
            });

            const cards = [];

            for (const cardType of cardTypes) {
                const card = await CardService.create({
                    cardTypeId: cardType.id,
                });

                cards.push(card);
            }

            expect(GameService.hasSet(cards, Color.RED)).toBe(false);
        });

    });

    describe('Actions', () => {
        let game: Game;
        let playerA: Player;
        let playerB: Player;

        beforeAll(async () => {
            game = await GameService.create(userA.id);
            playerA = await PlayerService.create({
                userId: userA.id,
                gameId: game.id,
            });

            playerB = await PlayerService.create({
                userId: userB.id,
                gameId: game.id,
            });
        });

        describe('handleDeploy', () => {

            it('should update player\'s position', async () => {
                const actionPayload: IActionPayload = {
                    targetIndex: 4,
                    type: ActionType.DEPLOY,
                }

                await GameService.handleDeploy(playerA, actionPayload);

                const updatedPlayer = await Player.findOne({
                    where: {
                        id: playerA.id,
                    }
                });

                expect(updatedPlayer.position).toBe(actionPayload.targetIndex);
            });

            it(`should update the game state from ${GameState.SETUP} to ${GameState.STARTED} when both players have positions`, async () => {
                const actionPayload: IActionPayload = {
                    targetIndex: 5,
                    type: ActionType.DEPLOY,
                }

                await GameService.handleDeploy(playerB, actionPayload);

                const updatedGame = await Game.findOne({
                    where: {
                        id: game.id,
                    }
                });

                expect(updatedGame.state).toBe(GameState.STARTED);

            });

        });

        describe('handleReplace', () => {

            afterEach(async () => {
                await Card.truncate();
            });

            it('should place 3 cards from the player\'s instead of 3 cards in the continuum (lower index)', async () => {
                await GameService.start(game.id);

                const playerCards = await Card.findAll({
                    where: {
                        playerId: playerA.id,
                    }
                });

                const playerCardIds = playerCards.map(c => c.id);

                const actionPayload: IActionPayload = {
                    targetIndex: 6,
                    type: ActionType.REPLACE,
                }

                await GameService.handleReplace({ ...playerA.toJSON(), position: 5 }, actionPayload);


                const updatedContinuumCards = await Card.findAll({
                    where: {
                        gameId: game.id,
                        index: {
                            [Op.in]: [6, 7, 8]
                        }
                    }
                });


                const updatedContinuumCardIds = updatedContinuumCards.map(c => c.id);

                expect(updatedContinuumCardIds).toEqual(playerCardIds);
            });

            it('should place 3 cards from the continuum into the player\'s hand', async () => {
                await GameService.start(game.id);


                const cardsToPickUp = await Card.findAll({
                    where: {
                        gameId: game.id,
                        index: {
                            [Op.in]: [6, 7, 8]
                        }
                    }
                });

                const cardsToPickUpIds = cardsToPickUp.map(c => c.id);

                const actionPayload: IActionPayload = {
                    targetIndex: 6,
                    type: ActionType.REPLACE,
                }

                await GameService.handleReplace({ ...playerA.toJSON(), position: 5 }, actionPayload);

                const updatedPlayerCards = await Card.findAll({
                    where: {
                        index: null,
                        playerId: playerA.id,
                    }
                });

                const updatedPlayerCardIds = updatedPlayerCards.map(c => c.id);

                expect(updatedPlayerCardIds).toEqual(cardsToPickUpIds);
            });

            it('should place 3 cards from the player\'s instead of 3 cards in the continuum (higher index)', async () => {
                await GameService.start(game.id);

                const playerCards = await Card.findAll({
                    where: {
                        playerId: playerA.id,
                    }
                });

                const playerCardIds = playerCards.map(c => c.id);

                const actionPayload: IActionPayload = {
                    targetIndex: 4,
                    type: ActionType.REPLACE,
                }

                await GameService.handleReplace({ ...playerA.toJSON(), position: 5 }, actionPayload);


                const updatedContinuumCards = await Card.findAll({
                    where: {
                        gameId: game.id,
                        index: {
                            [Op.in]: [1, 2, 3]
                        }
                    }
                });

                const updatedContinuumCardIds = updatedContinuumCards.map(c => c.id);

                expect(updatedContinuumCardIds).toEqual(playerCardIds);
            });

        });

        describe('handleMove', () => {

            afterEach(async () => {
                await Card.truncate();
            });

            it('should update the player\'s position to the target index', async () => {
                await GameService.start(game.id);

                const playerCards = await await Card.findAll({
                    where: {
                        playerId: playerA.id,
                    }
                });

                const actionPayload: IActionPayload = {
                    sourceCardId: playerCards[0].id,
                    targetIndex: 6,
                    type: ActionType.MOVE,
                }

                await GameService.handleMove({ ...playerA.toJSON(), position: 5 }, actionPayload);

                const updatedPlayer = await Player.findOne({
                    where: {
                        id: playerA.id,
                    }
                });

                expect(updatedPlayer.position).toEqual(actionPayload.targetIndex);
            });

            it('should swap the player\'s card with a card from the continuum', async () => {
                await GameService.start(game.id);

                const playerCards = await await Card.findAll({
                    where: {
                        playerId: playerA.id,
                    }
                });

                const actionPayload: IActionPayload = {
                    sourceCardId: playerCards[0].id,
                    targetIndex: 6,
                    type: ActionType.MOVE,
                };

                const targetCard = await Card.findOne({
                    where: {
                        gameId: game.id,
                        index: actionPayload.targetIndex,
                    }
                });

                await GameService.handleMove({ ...playerA.toJSON(), position: 5 }, actionPayload);


                const updatedPlayerCard = await Card.findAll({
                    where: {
                        playerId: playerA.id,
                        id: targetCard.id,
                    }
                });

                const updatedContinuumCard = await Card.findOne({
                    where: {
                        gameId: game.id,
                        index: actionPayload.targetIndex,
                    }
                });

                expect(updatedPlayerCard).toBeDefined();
                expect(updatedContinuumCard.id).toBe(actionPayload.sourceCardId);
            });

            it('should advance the codex color if the player has formed a set (i.e. \'paradox\')', async () => {
                await GameService.start(game.id);

                const currentGame = await Game.findOne({
                    where: {
                        id: game.id,
                    }
                });

                const playerCards = await await Card.findAll({
                    where: {
                        playerId: playerA.id,
                    }
                });

                const hasSetSpy = jest.spyOn(GameService, 'hasSet');

                hasSetSpy.mockReturnValueOnce(true);

                const actionPayload: IActionPayload = {
                    sourceCardId: playerCards[0].id,
                    targetIndex: 6,
                    type: ActionType.MOVE,
                };

                await GameService.handleMove({ ...playerA.toJSON(), position: 5 }, actionPayload);

                const updatedGame = await Game.findOne({
                    where: {
                        id: game.id,
                    }
                });

                expect(updatedGame.codexColor).toBe(GameService.getNextCodeColor(currentGame.codexColor));
            });

        });

    });

    describe('start', () => {
        let game: Game;
        let playerA: Player;
        let playerB: Player;

        beforeAll(async () => {
            game = await GameService.create(userA.id);
            playerA = await PlayerService.create({
                userId: userA.id,
                gameId: game.id,
            });

            playerB = await PlayerService.create({
                userId: userB.id,
                gameId: game.id,
            });
        });

        afterEach(async () => {
            await Card.truncate();
        });

        it('should deal 9 continuum cards', async () => {
            await GameService.start(game.id);

            const continuumCards = await Card.findAll({
                where: {
                    gameId: game.id,
                    playerId: null,
                    index: {
                        [Op.not]: null,
                    }
                }
            });

            expect(continuumCards.length).toBe(9);
        });


        it('should deal 3 cards to each player', async () => {
            await GameService.start(game.id);

            const playerACards = await Card.findAll({
                where: {
                    gameId: game.id,
                    playerId: playerA.id,
                }
            });

            const playerBCards = await Card.findAll({
                where: {
                    gameId: game.id,
                    playerId: playerB.id,
                }
            });

            expect(playerACards.length).toBe(3);
            expect(playerBCards.length).toBe(3);
        });


        it('should deal one Codex card', async () => {
            await GameService.start(game.id);

            const codexCard = await Card.findOne({
                where: {
                    gameId: game.id,
                    playerId: null,
                    index: null,
                }
            });

            expect(codexCard).toBeDefined();
        });

        it('should set the starting Codex color to the color of the last card in the continuum', async () => {
            await GameService.start(game.id);

            const updatedGame = await Game.findOne({
                where: {
                    id: game.id,
                }
            });

            const lastCard = await Card.findOne({
                where: {
                    gameId: game.id,
                    playerId: null,
                    index: {
                        [Op.not]: null,
                    },
                },
                order: [['id', 'DESC']],
                include: [
                    CardType,
                ]
            });

            expect(updatedGame.codexColor).toBe(lastCard.type.color);
        });

    });

});
