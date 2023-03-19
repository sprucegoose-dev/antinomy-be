import { Card } from '../models/card.model';
import { Game } from '../models/game.model';
import { Player } from '../models/player.model';
import { ICard } from './card.interface';
import { Color } from './card_type.interface';

export enum GameState {
    CREATED = 'created',
    ENDED = 'ended',
    SETUP = 'setup',
    STARTED = 'started',
}

export enum GamePhase {
    DEPLOYMENT = 'deployment',
    MOVEMENT = 'movement',
    COMBAT = 'combat',
    REPLACEMENT = 'replacement',
}

export interface IGameState {
    activePlayerId: number;
    winnerId: number;
    cards: ICard[];
    codexColor: Color;
    points: number;
    state: GameState;
    phase: GamePhase;
}

export interface ICombatData {
    game: Game;
    player: Player;
    opponent: Player;
    playerCards: Card[];
    opponentCards: Card[];
}

export interface
