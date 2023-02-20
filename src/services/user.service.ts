import bcrypt from 'bcrypt';
import moment from 'moment';
import { v4 as uuid } from 'uuid';

import {
    CustomException,
    ERROR_NOT_FOUND,
    ERROR_UNAUTHORIZED,
} from '../helpers/ExceptionHandler';
import { User } from '../models/user.model';

class UserService {

    static async create(payload: any): Promise<User> {
        const {
            username,
            email,
            password,
        } = payload;

        const sessionId = uuid();
        const sessionExp = moment().add(7, 'days').format('YYYY-MM-DD HH:mm:ss');

        const user = await User.create({
            username,
            email,
            password: await bcrypt.hash(password, 10),
            sessionId,
            sessionExp,
        });

        return user.toJSON();
    }

    static async login(email: string, password: string): Promise<any> {
        const user = await User.findOne({ where: { email }});

        if (!user) {
            throw new CustomException(ERROR_NOT_FOUND, 'The provided email does not exist');
        }

        if (await bcrypt.compare(password, user.toJSON().password)) {
            user.sessionId = uuid();
            user.sessionExp = moment().add(7, 'days').format('YYYY-MM-DD HH:mm:ss');
            await user.save();
        } else {
            throw new CustomException(ERROR_UNAUTHORIZED, 'Incorrect email and password combination');
        }

        return {
            userId: user.id,
            sessionId: user.sessionId,
            sessionExp: user.sessionExp,
            username: user.username,
        };
    }

    static async update(userId: number, payload: any): Promise<User> {
        const {
            username,
            email,
            password,
        } = payload;

        await User.update({
            username,
            email,
            password: await bcrypt.hash(password, 10),
        }, {
            where: {
                id: userId,
            }
        });

        return await this.getOne(userId);
    }

    static async delete(userId: number): Promise<void> {
        await User.destroy({
            where: {
                id: userId,
            }
        });
    }

    static async getOne(userId: number): Promise<User> {
        const user = await User.findOne({
            where: {
                id: userId,
            }
        });

        if (!user) {
            throw new CustomException(ERROR_NOT_FOUND, 'User not found');
        }

        return user.toJSON();
    }

    static async getAll(): Promise<User[]> {
        const users = await User.findAll();

        return users.map(user => user.toJSON());
    }

    static async findBySessionId(sessionId: string, asJson: boolean = true): Promise<User> {
        const user = await User.findOne({ where: { sessionId }});

        if (!user) {
            throw new CustomException(ERROR_NOT_FOUND, 'User not found');
        }

        return asJson ? user.toJSON() : user;
    }

    static async extendSession(sessionId: string): Promise<void> {
        const user = await this.findBySessionId(sessionId, false);
        user.sessionExp = moment().add(7, 'days').format('YYYY-MM-DD HH:mm:ss');
        await user.save();
    }

};

export default UserService;
