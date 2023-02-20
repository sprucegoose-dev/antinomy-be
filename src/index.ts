
import UsersController from './controllers/user.controller';
import GamesController from './controllers/game.controller';

const express = require('express');
const app = require('express')();
const http = require('http').createServer(app);
const cors = require('cors');

app.use(express.static('public'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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


http.listen(3000, () => {
    console.log('listening on *:3000');
});
