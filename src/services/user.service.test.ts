import bcrypt from 'bcrypt';
import { ERROR_NOT_FOUND, ERROR_UNAUTHORIZED } from '../helpers/ExceptionHandler';
import { User } from '../models/user.model';
import UserService from './user.service';

describe('User', () => {

    describe('create', () => {

        it('should store a new User in the database', async () => {
            const data = {
                username: 'SpruceGoose',
                email: 'spruce.goose@antinomy.com',
                password: 'alrighty.then',
            }

            const user = await UserService.create(data);

            expect(user.username).toBe(data.username);
            expect(user.email).toBe(data.email);
            expect(await bcrypt.compare(data.password, user.password)).toBe(true);
            expect(Date.parse((String(user.createdAt)))).not.toBeNaN();
            expect(Date.parse((String(user.updatedAt)))).not.toBeNaN();
        });

    });

    describe('update', () => {

        it('should store a new user in the database', async () => {
            const data = {
                username: 'SpruceGoose',
                email: 'spruce.goose@gmail.com',
                password: 'landed.on.the.moon!',
            }

            const user = await UserService.update(1, data);
            expect(user.username).toBe(data.username);
            expect(user.email).toBe(data.email);
            expect(await bcrypt.compare(data.password, user.password)).toBe(true);
        });

    });

    describe('getOne', () => {

        it('should retrieve an existing user from the database', async () => {
            const user = await UserService.getOne(1);
            expect(user).toBeDefined();
        });

    });

    describe('delete', () => {

        it('should delete a user from the database', async () => {
            try {
                await UserService.delete(1);
                const user = await User.findOne({
                    where: {
                        id: 1,
                    }
                });
                expect(user).toBeNull();
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

});
