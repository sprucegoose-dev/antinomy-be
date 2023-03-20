import { Socket } from 'socket.io';

import UsersController from './controllers/user.controller';
import GamesController from './controllers/game.controller';
import AuthMiddleware from './middleware/auth.middleware';
import { IGameState } from './types/game.interface';
import { EventType } from './types/event.interface';

const express = require('express');
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const cors = require('cors');

app.use(express.static('public'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(AuthMiddleware.isAuthenticated);

app.post('/user/signUp', UsersController.create);
app.post('/user/login', UsersController.login);
app.get('/user', UsersController.getDetails);
app.patch('/user', UsersController.update);
app.delete('/user', UsersController.delete);

app.post('/game', GamesController.create);
app.post('/game/:id/start', GamesController.start);
app.post('/game/:id/join', GamesController.join);
app.post('/game/:id/action', GamesController.handleAction);
app.post('/game/:id/leave', GamesController.leave);
app.get('/game/:id', GamesController.getState);
app.get('/game/all', GamesController.getActiveGames);
app.get('/game/:id/actions', GamesController.getActions);

export const gameSocket = process.env.NODE_ENV === 'production' ? io.of('websocket') : io;

gameSocket.on('connection', (socket: Socket) => {

    socket.on(EventType.JOIN_GAME, (gameId: number) => {
        socket.join(`game-${gameId}`);
    });

    socket.on(EventType.GAME_UPDATE,  async (gameState: IGameState) => {
        gameSocket.to(`game-${gameState.id}`).emit('updateGameState', gameState);
    });

    socket.on(EventType.ACTIVE_GAMES_UPDATE, async (activeGames: Omit<IGameState, 'cards'>[]) => {
        gameSocket.emit('updateActiveGames', activeGames);
    });

});

http.listen(3000, () => {
    console.log('listening on *:3000');
});
