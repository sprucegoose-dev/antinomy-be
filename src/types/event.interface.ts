export enum EventType {
    ACTIVE_GAMES_UPDATE = 'onUpdateActiveGames',
    GAME_UPDATE = 'onUpdateGameState',
    JOIN_GAME= 'onJoinGame',
    LEAVE_GAME= 'onLeaveGame',
}

export interface IEvent {
    payload?: any;
    type: EventType;
}

