import { Injectable, NgZone } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface ParticipantEvent {
    alias: string;
    connectionId: string;
}

export interface ClipboardUpdate {
    text: string;
    senderConnectionId: string;
    senderAlias?: string;
}

@Injectable({ providedIn: 'root' })
export class ClipboardService {
    private hubConnection: signalR.HubConnection | null = null;

    // Observables for components to subscribe to
    private clipboardUpdated = new Subject<ClipboardUpdate>();
    private participantJoined = new Subject<ParticipantEvent>();
    private participantLeft = new Subject<ParticipantEvent>();
    private fileAvailable = new Subject<any>();
    private fileDeleted = new Subject<string>();
    private sessionClosed = new Subject<string>();
    private currentParticipants = new BehaviorSubject<any[]>([]);
    private connectionId = new BehaviorSubject<string | null>(null);
    private connected = new BehaviorSubject<boolean>(false);

    clipboardUpdated$ = this.clipboardUpdated.asObservable();
    participantJoined$ = this.participantJoined.asObservable();
    participantLeft$ = this.participantLeft.asObservable();
    fileAvailable$ = this.fileAvailable.asObservable();
    fileDeleted$ = this.fileDeleted.asObservable();
    sessionClosed$ = this.sessionClosed.asObservable();
    currentParticipants$ = this.currentParticipants.asObservable();
    connectionId$ = this.connectionId.asObservable();
    connected$ = this.connected.asObservable();

    constructor(private authService: AuthService, private ngZone: NgZone) { }

    async connect(): Promise<void> {
        const token = this.authService.getToken();
        if (!token) throw new Error('No auth token available');

        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${environment.hubUrl}?access_token=${token}`)
            .withAutomaticReconnect([0, 1000, 5000, 10000])
            .configureLogging(signalR.LogLevel.Information)
            .build();

        this.registerHandlers();

        await this.hubConnection.start();
        this.connectionId.next(this.hubConnection.connectionId ?? null);
        this.connected.next(true);
    }

    private registerHandlers(): void {
        if (!this.hubConnection) return;

        this.hubConnection.on('ClipboardUpdated', (text: string, senderConnectionId: string, senderAlias?: string) => {
            this.ngZone.run(() => {
                this.clipboardUpdated.next({ text, senderConnectionId, senderAlias });
            });
        });

        this.hubConnection.on('ParticipantJoined', (participant: ParticipantEvent) => {
            this.ngZone.run(() => {
                this.participantJoined.next(participant);
                const current = this.currentParticipants.value;
                this.currentParticipants.next([...current, participant]);
            });
        });

        this.hubConnection.on('ParticipantLeft', (participant: ParticipantEvent) => {
            this.ngZone.run(() => {
                this.participantLeft.next(participant);
                const current = this.currentParticipants.value.filter(p => p.connectionId !== participant.connectionId);
                this.currentParticipants.next(current);
            });
        });

        this.hubConnection.on('CurrentParticipants', (participants: any[]) => {
            this.ngZone.run(() => {
                this.currentParticipants.next(participants);
            });
        });

        this.hubConnection.on('FileAvailable', (file: any) => {
            this.ngZone.run(() => {
                this.fileAvailable.next(file);
            });
        });

        this.hubConnection.on('FileDeleted', (fileId: string) => {
            this.ngZone.run(() => {
                this.fileDeleted.next(fileId);
            });
        });

        this.hubConnection.on('SessionClosed', (reason: string) => {
            this.ngZone.run(() => {
                this.sessionClosed.next(reason);
            });
        });

        this.hubConnection.on('Error', (message: string) => {
            console.error('Hub error:', message);
        });

        this.hubConnection.onreconnected(() => {
            this.ngZone.run(() => {
                this.connected.next(true);
                this.connectionId.next(this.hubConnection?.connectionId ?? null);
            });
        });

        this.hubConnection.onreconnecting(() => {
            this.ngZone.run(() => {
                this.connected.next(false);
            });
        });

        this.hubConnection.onclose(() => {
            this.ngZone.run(() => {
                this.connected.next(false);
            });
        });
    }

    async joinSession(sessionId: string, alias: string): Promise<void> {
        if (!this.hubConnection) throw new Error('Not connected');
        await this.hubConnection.invoke('JoinSession', sessionId, alias);
    }

    async leaveSession(sessionId: string): Promise<void> {
        if (!this.hubConnection) throw new Error('Not connected');
        await this.hubConnection.invoke('LeaveSession', sessionId);
    }

    async updateClipboard(sessionId: string, text: string): Promise<void> {
        if (!this.hubConnection) throw new Error('Not connected');
        await this.hubConnection.invoke('UpdateClipboard', sessionId, text);
    }

    async notifyFileReady(sessionId: string, fileMetadata: any): Promise<void> {
        if (!this.hubConnection) throw new Error('Not connected');
        await this.hubConnection.invoke('NotifyFileReady', sessionId, fileMetadata);
    }

    async notifyFileDeleted(sessionId: string, fileId: string): Promise<void> {
        if (!this.hubConnection) throw new Error('Not connected');
        await this.hubConnection.invoke('NotifyFileDeleted', sessionId, fileId);
    }

    async disconnect(): Promise<void> {
        if (this.hubConnection) {
            await this.hubConnection.stop();
            this.hubConnection = null;
            this.connected.next(false);
            this.connectionId.next(null);
            this.currentParticipants.next([]);
        }
    }
}
