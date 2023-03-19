import { Op } from 'sequelize';
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
                    cardId: null,
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
                    cardId: null,
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

    });



});
