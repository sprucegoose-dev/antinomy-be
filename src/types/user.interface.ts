export interface IUserRequest {
    email: string;
    password: string;
    username: string;
}

export const PASSWORD_MIN_CHARS = 8;
export const USERNAME_MIN_CHARS = 3;
