import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';

const SALT_ROUNDS = 12;
const JWT_EXPIRES_IN = '7d';

export interface SignupInput {
    name: string;
    email: string;
    password: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface AuthResult {
    user: { id: string; name: string; email: string; createdAt: Date };
    token: string;
}

function generateToken(id: string, email: string): string {
    const secret = process.env.JWT_SECRET!;
    return jwt.sign({ id, email }, secret, { expiresIn: JWT_EXPIRES_IN });
}

export async function signup(input: SignupInput): Promise<AuthResult> {
    const { name, email, password } = input;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        throw new Error('An account with this email already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
        data: { name, email, password: hashedPassword },
        select: { id: true, name: true, email: true, createdAt: true },
    });

    const token = generateToken(user.id, user.email);
    return { user, token };
}

export async function login(input: LoginInput): Promise<AuthResult> {
    const { email, password } = input;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid email or password.');
    }

    const token = generateToken(user.id, user.email);
    return {
        user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
        token,
    };
}

export async function getMe(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
    });

    if (!user) {
        throw new Error('User not found.');
    }

    return user;
}
