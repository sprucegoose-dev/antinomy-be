export enum PlayerOrientation {
    TOP = 'top',
    BOTTOM = 'bottom',
}

export interface IPlayer {
    id: number;
    userId: number;
    gameId: number;
    position: number;
    points: number;
    orientation: PlayerOrientation;
}
