import bcrypt from 'bcrypt';
import moment from 'moment';

import { ERROR_NOT_FOUND, ERROR_UNAUTHORIZED } from '../helpers/ExceptionHandler';
import { User } from '../models/user.model';
import UserService from './user.service';

describe('User', () => {
    let userData: any;

    beforeEach(async () => {
        userData = {
            username: 'SpruceGoose',
            email: 'spruce.goose@antinomy.com',
            password: 'alrighty.then',
        };

        await User.truncate();
    });

    describe('create', () => {

        it('should store a new User in the database', async () => {
            const user = await UserService.create(userData);
            expect(user.username).toBe(userData.username);
            expect(user.email).toBe(userData.email);
            expect(await bcrypt.compare(userData.password, user.password)).toBe(true);
            expect(Date.parse((String(user.createdAt)))).not.toBeNaN();
            expect(Date.parse((String(user.updatedAt)))).not.toBeNaN();
        });

    });

    describe('update', () => {

        it('should update a user in the database', async () => {
            const user = await UserService.create(userData);
            const updatedData = {
                username: 'SpruceGoose2',
                email: 'spruce.goose@gmail.com',
                password: 'landed.on.the.moon!',
            }
            const updatedUser = await UserService.update(user.id, updatedData);
            expect(updatedUser.username).toBe(updatedData.username);
            expect(updatedUser.email).toBe(updatedData.email);
            expect(await bcrypt.compare(updatedData.password, updatedUser.password)).toBe(true);
        });

    });

    describe('getOne', () => {

        it('should retrieve an existing user from the database', async () => {
            const newUser = await UserService.create(userData);
            const existingUser = await UserService.getOne(newUser.id);
            expect(existingUser).toBeDefined();
        });

    });

    describe('delete', () => {

        it('should delete a user from the database', async () => {
            try {
                const user = await UserService.create(userData);
                await UserService.delete(user.id);
                const deletedUser = await User.findOne({
                    where: {
                        id: user.id,
                    }
                });
                expect(deletedUser).toBeNull();
            } catch (error) {
                console.log(error);
            }
        });

    });

    describe('login', () => {

        it('should log the user in if the email and password are correct', async () => {
            const data = {
                username: 'new-user-2',
                email: 'new-user-2@gmail.com',
                password: 'correct-password',
            }

            const user = await UserService.create(data);
            const response = await UserService.login(data.email, 'correct-password');

            expect(response.userId).toBe(user.id);
            expect(response.sessionId).toBeDefined();
            expect(response.sessionExp).toBeDefined();
            expect(response.username).toBe(user.username);
        });

        it('should throw an exception if the user\'s email doesn\'t exist', async () => {
            try {
                await UserService.login('invalid-email@gmail.com', 'yummy');
            } catch (error: any) {
                expect(error.type).toBe(ERROR_NOT_FOUND);
            }
        });

        it('should throw an exception if the password is incorrect', async () => {
            try {
                const data = {
                    username: 'new-user',
                    email: 'new-user@gmail.com',
                    password: 'correct-password',
                }

                await UserService.create(data);
                await UserService.login(data.email, 'incorrect-password');
            } catch (error: any) {
                expect(error.type).toBe(ERROR_UNAUTHORIZED);
            }
        });

    });

    describe('findBySessionId', () => {

        it('should return a user based on a session ID', async () => {
            const newUser = await UserService.create(userData);
            const existingUser = await UserService.findBySessionId(newUser.sessionId);
            expect(existingUser.id).toBe(newUser.id);
        });

        it('should throw an exception if the session ID doesn\'t exist', async () => {
            try {
                await UserService.findBySessionId('invalid-session-id');
            } catch (error: any) {
                expect(error.type).toBe(ERROR_NOT_FOUND);
            }
        });

    });

    describe('extendSession', () => {

        it('should extend the user session', async () => {
            try {
                const newUser = await UserService.create(userData);
                await UserService.extendSession(newUser.sessionId);
                const existingUser = await UserService.getOne(newUser.id);
                expect(moment(existingUser.sessionExp).isAfter(newUser.sessionExp)).toBe(true);
            } catch (error) {
                console.log(error);
            }

        });

    });

});
