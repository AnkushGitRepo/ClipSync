import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FileTransferDto } from './session.service';

@Injectable({ providedIn: 'root' })
export class FileTransferService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    uploadFile(sessionId: string, file: File): Observable<HttpEvent<FileTransferDto>> {
        const formData = new FormData();
        formData.append('file', file, file.name);

        const req = new HttpRequest('POST', `${this.apiUrl}/sessions/${sessionId}/files`, formData, {
            reportProgress: true
        });

        return this.http.request<FileTransferDto>(req);
    }

    listFiles(sessionId: string): Observable<FileTransferDto[]> {
        return this.http.get<FileTransferDto[]>(`${this.apiUrl}/sessions/${sessionId}/files`);
    }

    deleteFile(sessionId: string, fileId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/sessions/${sessionId}/files/${fileId}`);
    }

    getDownloadUrl(publicUrl: string): string {
        // For local dev, the public URL is relative to the API
        if (publicUrl.startsWith('/')) {
            return `http://localhost:5050${publicUrl}`;
        }
        return publicUrl;
    }
}
