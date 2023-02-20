export enum PlayerOrientation {
    TOP = 'top',
    BOTTOM = 'top',
}

export interface IPlayer {
    userId: number;
    gameId: number;
    position: number;
    points: number;
}
