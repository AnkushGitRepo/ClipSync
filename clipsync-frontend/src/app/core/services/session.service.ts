import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SessionDto {
    id: string;
    code: string;
    hasPin: boolean;
    createdAt: string;
    expiresAt: string;
    isActive: boolean;
    currentClipboardText: string;
    participants: ParticipantDto[];
}

export interface ParticipantDto {
    id: string;
    connectionId: string;
    alias: string;
    joinedAt: string;
}

export interface FileTransferDto {
    id: string;
    fileName: string;
    contentType: string;
    sizeBytes: number;
    publicUrl: string;
    uploadedBy: string;
    uploadedAt: string;
    expiresAt: string;
}

export interface SessionCreatedResponse {
    session: SessionDto;
    token: string;
    ownerId: string;
}

export interface SessionJoinedResponse {
    session: SessionDto;
    token: string;
}

@Injectable({ providedIn: 'root' })
export class SessionService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    createSession(alias: string, pin?: string): Observable<SessionCreatedResponse> {
        return this.http.post<SessionCreatedResponse>(`${this.apiUrl}/sessions`, { alias, pin });
    }

    getSessionByCode(code: string): Observable<SessionDto> {
        return this.http.get<SessionDto>(`${this.apiUrl}/sessions/${code}`);
    }

    joinSession(sessionId: string, code: string, alias: string, pin?: string): Observable<SessionJoinedResponse> {
        return this.http.post<SessionJoinedResponse>(`${this.apiUrl}/sessions/${sessionId}/join`, { code, alias, pin });
    }

    closeSession(sessionId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/sessions/${sessionId}`);
    }
}
