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
