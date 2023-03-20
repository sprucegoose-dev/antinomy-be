export enum EventType {
    ACTIVE_GAMES_UPDATE = 'onUpdateActiveGames',
    GAME_UPDATE = 'onUpdateGameState',
    JOIN_GAME= 'onJoinGame',
}

export interface IEvent {
    gameId?: number;
    payload?: any;
    type: EventType;
}

