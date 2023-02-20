export enum ActionType {
    MOVE = 'move',
    DEPLOY = 'deploy',
    REPLACE = 'replace',
}

export interface IActionPayload {
    cardId: number;
    targetIndex: number;
    type: ActionType;
}
