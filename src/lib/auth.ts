import { type JWTPayload, jwtVerify, SignJWT } from "jose";

const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) {
	throw new Error("SESSION_SECRET environment variable is required");
}

const key = new TextEncoder().encode(SESSION_SECRET);
const COOKIE_NAME = "session";
const EXPIRES_IN = "7d";

export interface SessionPayload {
	userId: number;
	email: string;
	role: string;
}

export async function createSession(payload: SessionPayload): Promise<string> {
	return new SignJWT({ ...payload } as unknown as JWTPayload)
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime(EXPIRES_IN)
		.sign(key);
}

export async function verifySession(
	token: string,
): Promise<SessionPayload | null> {
	try {
		const { payload } = await jwtVerify(token, key);
		return {
			userId: payload.userId as number,
			email: payload.email as string,
			role: payload.role as string,
		};
	} catch {
		return null;
	}
}

export function getSessionCookieName(): string {
	return COOKIE_NAME;
}
