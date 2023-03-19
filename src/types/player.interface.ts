export enum PlayerOrientation {
    TOP = 'top',
    BOTTOM = 'top',
}

export interface ICreatePlayer {
    userId: number;
    gameId: number;
}

export interface IPlayer {
    id: number;
    userId: number;
    gameId: number;
    position: number;
    points: number;
}
