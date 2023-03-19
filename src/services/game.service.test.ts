import { Op } from 'sequelize';
import { CardType } from '../models/card_type.model';
import { Color, Suit } from '../types/card_type.interface';
import CardService from './card.service';
import GameService from './game.service';

describe('GameService', () => {

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

});
