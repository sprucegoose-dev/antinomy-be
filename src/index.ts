import { Socket } from 'socket.io';

import UsersController from './controllers/user.controller';
import GamesController from './controllers/game.controller';
import AuthMiddleware from './middleware/auth.middleware';
import { IGameState } from './types/game.interface';

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

app.post('/user', UsersController.create);
app.post('/user/login', UsersController.login);
app.get('/user/:id', UsersController.getOne);
app.patch('/user/:id', UsersController.update);
app.delete('/user/:id', UsersController.delete);

app.post('/game', GamesController.create);
app.post('/game/:id/start', GamesController.start);
app.post('/game/:id/join', GamesController.join);
app.post('/game/:id/action', GamesController.performAction);
app.post('/game/:id/leave', GamesController.leave);
app.get('/game/:id', GamesController.getState);
app.get('/game/all', GamesController.getActiveGames);
app.get('/game/:id/actions', GamesController.getActions);

export const gameSocket = process.env.NODE_ENV === 'production' ? io.of('websocket') : io;

gameSocket.on('connection', (socket: Socket) => {

    socket.on('joinGameChannel', (gameId: number) => {
        socket.join(`game-${gameId}`);
    });

    socket.on('onUpdateGameState',  async (gameState: IGameState) => {
        gameSocket.to(`game-${gameState.id}`).emit('updateGameState', gameState);
    });

    socket.on('onUpdateActiveGames', async (activeGames: Omit<IGameState, 'cards'>[]) => {
        gameSocket.emit('updateActiveGames', activeGames);
    });

});

http.listen(3000, () => {
    console.log('listening on *:3000');
});
