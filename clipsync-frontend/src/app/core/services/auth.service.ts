import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private token: string | null = null;
    private sessionId: string | null = null;
    private ownerId: string | null = null;
    private alias: string | null = null;

    setToken(token: string): void {
        this.token = token;
    }

    getToken(): string | null {
        return this.token;
    }

    setSessionId(id: string): void {
        this.sessionId = id;
    }

    getSessionId(): string | null {
        return this.sessionId;
    }

    setOwnerId(id: string): void {
        this.ownerId = id;
    }

    getOwnerId(): string | null {
        return this.ownerId;
    }

    setAlias(alias: string): void {
        this.alias = alias;
    }

    getAlias(): string | null {
        return this.alias;
    }

    isAuthenticated(): boolean {
        return this.token !== null;
    }

    clear(): void {
        this.token = null;
        this.sessionId = null;
        this.ownerId = null;
        this.alias = null;
    }
}
