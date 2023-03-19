import { Request } from "express";

export enum ActionType {
    MOVE = 'move',
    DEPLOY = 'deploy',
    REPLACE = 'replace',
}

export interface IActionPayload {
    sourceCardId?: number;
    targetIndex: number;
    type: ActionType;
}

export interface IActionRequest extends Request {
    body: IActionPayload;
}
