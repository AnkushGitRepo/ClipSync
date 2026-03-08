import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { ClipboardService } from '../../core/services/clipboard.service';
import { FileTransferService } from '../../core/services/file-transfer.service';
import { AuthService } from '../../core/services/auth.service';
import { SessionService, FileTransferDto } from '../../core/services/session.service';
import { HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-clipboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="clipboard-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="session-badge">
            <span class="badge-dot" [class.connected]="isConnected"></span>
            <span class="badge-text">{{ isConnected ? 'Connected' : 'Reconnecting...' }}</span>
          </div>
          <h3>Participants</h3>
        </div>
        <div class="participants-list">
          <div class="participant" *ngFor="let p of participants">
            <div class="participant-avatar" [style.background]="getAvatarColor(p.alias)">
              {{ p.alias?.charAt(0)?.toUpperCase() }}
            </div>
            <div class="participant-info">
              <span class="participant-name">{{ p.alias }}</span>
              <span class="participant-status">Online</span>
            </div>
            <span class="online-dot"></span>
          </div>
          <p class="empty-state" *ngIf="participants.length === 0">
            Waiting for others to join...
          </p>
        </div>
        <div class="sidebar-footer">
          <button class="btn-leave" (click)="leaveSession()">Leave Session</button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <!-- Toolbar -->
        <div class="toolbar">
          <div class="toolbar-left">
            <h2>📋 Shared Clipboard</h2>
            <span class="char-count">{{ clipboardText.length | number }} characters</span>
          </div>
          <div class="toolbar-center">
             <div class="session-code-display" *ngIf="sessionCode">
                <span class="code-label">Session Code:</span>
                <span class="code-value">{{ sessionCode }}</span>
             </div>
          </div>
          <div class="toolbar-right">
            <button class="btn-icon" (click)="copyAll()" title="Copy all text">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              {{ copySuccess ? 'Copied!' : 'Copy All' }}
            </button>
            <button class="btn-icon" (click)="clearClipboard()" title="Clear clipboard">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
              Clear
            </button>
            <button class="btn-icon" (click)="toggleTheme()" title="Toggle Theme">
              <svg *ngIf="isDarkMode" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
              <svg *ngIf="!isDarkMode" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
              Theme
            </button>
          </div>
        </div>

        <!-- Clipboard Area -->
        <div class="clipboard-area" [class.remote-update]="showRemoteFlash">
          <textarea
            class="clipboard-textarea"
            [(ngModel)]="clipboardText"
            (ngModelChange)="onTextChange($event)"
            placeholder="Start typing or paste content here... All connected users will see changes in real time."
          ></textarea>
        </div>

        <!-- Status Bar -->
        <div class="status-bar">
          <span *ngIf="lastUpdatedBy">
            Last updated by <strong>{{ lastUpdatedBy }}</strong> at {{ lastUpdatedAt | date:'shortTime' }}
          </span>
          <span *ngIf="!lastUpdatedBy">Start typing to share with others</span>
        </div>

        <!-- File Transfer Section -->
        <div class="file-section">
          <div class="file-header">
            <h3>📁 File Sharing</h3>
          </div>

          <!-- Drop Zone -->
          <div class="drop-zone"
               (dragover)="onDragOver($event)"
               (dragleave)="onDragLeave($event)"
               (drop)="onDrop($event)"
               [class.drag-active]="isDragging"
               (click)="fileInput.click()">
            <input #fileInput type="file" hidden (change)="onFileSelected($event)" multiple />
            <div class="drop-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <p>Drag & drop files here or click to browse</p>
            <span class="drop-hint">Max 50MB per file</span>
          </div>

          <!-- Upload Progress -->
          <div class="upload-progress" *ngIf="uploadProgress >= 0">
            <div class="progress-info">
              <span>Uploading {{ uploadFileName }}...</span>
              <span>{{ uploadProgress }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="uploadProgress"></div>
            </div>
          </div>

          <!-- File List -->
          <div class="file-list" *ngIf="files.length > 0">
            <div class="file-item" *ngFor="let file of files">
              <div class="file-icon" [class.image-file]="file.contentType?.startsWith('image/')">
                {{ getFileIcon(file.contentType) }}
              </div>
              <div class="file-info">
                <span class="file-name">{{ file.fileName }}</span>
                <span class="file-meta">{{ formatFileSize(file.sizeBytes) }} · {{ file.uploadedBy }}</span>
              </div>
              <a class="btn-download" [href]="getDownloadUrl(file.publicUrl)" target="_blank" download>
                ↓ Download
              </a>
            </div>
          </div>
        </div>
      </main>

      <!-- Toast Notifications -->
      <div class="toast-container">
        <div class="toast" *ngFor="let toast of toasts" [class]="'toast toast-' + toast.type">
          {{ toast.message }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .clipboard-layout {
      display: flex;
      height: 100vh;
      background: var(--bg-primary);
      color: var(--text-primary);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    /* Sidebar */
    .sidebar {
      width: 280px;
      min-width: 280px;
      background: var(--bg-secondary);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    .session-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      padding: 0.5rem 0.75rem;
      background: var(--bg-tertiary);
      border-radius: 8px;
      font-size: 0.8rem;
    }

    .badge-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--text-secondary);
      transition: background 0.3s;
    }
    .badge-dot.connected {
      background: var(--success);
      box-shadow: 0 0 8px var(--success-bg);
    }
    .badge-text { color: var(--text-secondary); }

    .sidebar-header h3 {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-muted);
      font-weight: 600;
    }

    .participants-list {
      flex: 1;
      padding: 0.75rem;
      overflow-y: auto;
    }

    .participant {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6rem 0.75rem;
      border-radius: 10px;
      transition: background 0.2s;
    }
    .participant:hover { background: var(--bg-tertiary); }

    .participant-avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.9rem;
      color: white;
      flex-shrink: 0;
    }

    .participant-info {
      flex: 1;
      min-width: 0;
    }
    .participant-name {
      display: block;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .participant-status {
      font-size: 0.75rem;
      color: var(--success);
    }

    .online-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--success);
      flex-shrink: 0;
    }

    .empty-state {
      color: var(--text-muted);
      font-size: 0.85rem;
      padding: 1rem;
      text-align: center;
    }

    .sidebar-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border-color);
    }

    .btn-leave {
      width: 100%;
      padding: 0.6rem;
      background: var(--danger-bg);
      color: var(--danger);
      border: 1px solid var(--danger-bg);
      border-radius: 10px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 0.2s;
    }
    .btn-leave:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.4);
    }

    /* Main Content */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .toolbar-left h2 {
      font-size: 1.1rem;
      font-weight: 700;
    }
    .char-count {
      font-size: 0.8rem;
      color: var(--text-muted);
      background: var(--bg-tertiary);
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
    }

    .toolbar-center {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
    }
    .session-code-display {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--accent-bg);
      border: 1px solid var(--accent-border);
      padding: 0.4rem 0.8rem;
      border-radius: 8px;
    }
    .code-label {
      font-size: 0.75rem;
      color: var(--accent-primary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }
    .code-value {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--accent-primary);
      letter-spacing: 0.15em;
      font-family: 'Courier New', monospace;
    }

    .toolbar-right {
      display: flex;
      gap: 0.5rem;
    }

    .btn-icon {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 0.75rem;
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s;
    }
    .btn-icon:hover {
      background: var(--accent-bg);
      border-color: var(--accent-border);
      color: var(--accent-primary);
    }

    /* Clipboard */
    .clipboard-area {
      flex: 1;
      padding: 1rem 1.5rem;
      min-height: 200px;
      transition: box-shadow 0.3s;
    }
    .clipboard-area.remote-update {
      box-shadow: inset 0 0 0 2px var(--accent-border);
    }

    .clipboard-textarea {
      width: 100%;
      height: 100%;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 1.25rem;
      color: var(--text-primary);
      font-size: 0.95rem;
      line-height: 1.7;
      resize: none;
      outline: none;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      box-sizing: border-box;
      transition: border-color 0.2s;
    }
    .clipboard-textarea:focus {
      border-color: var(--border-focus);
    }
    .clipboard-textarea::placeholder { color: var(--text-muted); }

    .status-bar {
      padding: 0.5rem 1.5rem;
      font-size: 0.8rem;
      color: var(--text-muted);
      border-top: 1px solid var(--border-color);
    }
    .status-bar strong { color: var(--accent-primary); }

    /* File Section */
    .file-section {
      border-top: 1px solid var(--border-color);
      padding: 1rem 1.5rem;
      max-height: 300px;
      overflow-y: auto;
    }

    .file-header {
      margin-bottom: 0.75rem;
    }
    .file-header h3 { font-size: 1rem; font-weight: 600; }

    .drop-zone {
      border: 2px dashed var(--border-color);
      border-radius: 16px;
      padding: 1.5rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      margin-bottom: 0.75rem;
    }
    .drop-zone:hover, .drop-zone.drag-active {
      border-color: var(--border-focus);
      background: var(--bg-tertiary);
    }
    .drop-icon {
      color: var(--text-muted);
      margin-bottom: 0.5rem;
    }
    .drop-zone p {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin-bottom: 0.25rem;
    }
    .drop-hint {
      color: var(--text-muted);
      font-size: 0.75rem;
    }

    .upload-progress {
      margin-bottom: 0.75rem;
    }
    .progress-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin-bottom: 0.25rem;
    }
    .progress-bar {
      height: 4px;
      background: var(--bg-hover);
      border-radius: 4px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #6366f1, #8b5cf6);
      border-radius: 4px;
      transition: width 0.2s;
    }

    .file-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .file-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      transition: background 0.2s;
    }
    .file-item:hover {
      background: var(--bg-tertiary);
    }

    .file-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: var(--accent-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;
    }
    .file-icon.image-file {
      background: var(--accent-bg);
    }

    .file-info {
      flex: 1;
      min-width: 0;
    }
    .file-name {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .file-meta {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .btn-download {
      padding: 0.4rem 0.75rem;
      background: var(--accent-bg);
      color: var(--accent-primary);
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .btn-download:hover {
      background: var(--accent-border);
    }

    /* Toast */
    .toast-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      z-index: 1000;
    }
    .toast {
      padding: 0.75rem 1.25rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 500;
      backdrop-filter: blur(20px);
      animation: slideIn 0.3s ease-out;
      color: var(--text-primary);
      border: 1px solid var(--border-color);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .toast-info {
      background: var(--bg-tertiary);
      border-color: var(--accent-border);
    }
    .toast-success {
      background: var(--bg-tertiary);
      border-color: var(--success);
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    @media (max-width: 768px) {
      .clipboard-layout { flex-direction: column; }
      .sidebar { width: 100%; min-width: 100%; max-height: 150px; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.08); }
      .participants-list { display: flex; gap: 0.5rem; overflow-x: auto; padding: 0.5rem; }
    }
  `]
})
export class ClipboardComponent implements OnInit, OnDestroy {
  clipboardText = '';
  participants: any[] = [];
  files: FileTransferDto[] = [];
  isConnected = false;
  lastUpdatedBy = '';
  lastUpdatedAt: Date | null = null;
  showRemoteFlash = false;
  copySuccess = false;
  isDragging = false;
  uploadProgress = -1;
  uploadFileName = '';
  toasts: { message: string; type: string }[] = [];
  isDarkMode = true;

  private textChanged = new Subject<string>();
  private destroy$ = new Subject<void>();
  private myConnectionId: string | null = null;

  public sessionCode: string = '';

  constructor(
    private clipboardService: ClipboardService,
    private fileTransferService: FileTransferService,
    private sessionService: SessionService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit(): Promise<void> {
    // Detect current theme or default to dark
    const savedTheme = localStorage.getItem('clipsync-theme');
    if (savedTheme === 'light') {
      this.isDarkMode = false;
      document.documentElement.setAttribute('data-theme', 'light');
    }

    const codeParam = this.route.snapshot.paramMap.get('code');
    if (codeParam) {
      this.sessionCode = codeParam.toUpperCase();
    }

    let sessionId = this.authService.getSessionId();
    let alias = this.authService.getAlias();

    // Auto-join logic if missing session but URL has code
    if ((!sessionId || !alias) && this.sessionCode) {
      this.showToast('Joining session automatically...', 'info');
      try {
        const randomAlias = 'User_' + Math.floor(1000 + Math.random() * 9000);
        this.sessionService.getSessionByCode(this.sessionCode).subscribe({
          next: (session: any) => {
            this.sessionService.joinSession(session.id, this.sessionCode, randomAlias).subscribe({
              next: (response: any) => {
                this.authService.setToken(response.token);
                this.authService.setSessionId(response.session.id);
                this.authService.setAlias(randomAlias);
                sessionId = response.session.id;
                alias = randomAlias;
                this.initializeClipboard(sessionId as string, alias);
              },
              error: () => this.router.navigate(['/'])
            });
          },
          error: () => this.router.navigate(['/'])
        });
        return; // Wait for async join to complete
      } catch (e) {
        this.router.navigate(['/']);
        return;
      }
    } else if (!sessionId || !alias) {
      this.router.navigate(['/']);
      return;
    }

    this.initializeClipboard(sessionId as string, alias as string);
  }

  private async initializeClipboard(sessionId: string, alias: string): Promise<void> {
    // Set up text debounce
    this.textChanged.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(text => {
      const sid = this.authService.getSessionId();
      if (sid) {
        this.clipboardService.updateClipboard(sid, text);
      }
    });

    // Subscribe to events
    this.clipboardService.clipboardUpdated$.pipe(takeUntil(this.destroy$)).subscribe(update => {
      if (update.senderConnectionId !== this.myConnectionId) {
        this.clipboardText = update.text;
        this.lastUpdatedBy = update.senderAlias || 'Unknown';
        this.lastUpdatedAt = new Date();
        this.showRemoteFlash = true;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.showRemoteFlash = false;
          this.cdr.detectChanges();
        }, 500);
      }
    });

    this.clipboardService.currentParticipants$.pipe(takeUntil(this.destroy$)).subscribe(p => {
      this.participants = p;
      this.cdr.detectChanges();
    });

    this.clipboardService.connectionId$.pipe(takeUntil(this.destroy$)).subscribe(id => {
      this.myConnectionId = id;
    });

    this.clipboardService.connected$.pipe(takeUntil(this.destroy$)).subscribe(c => {
      this.isConnected = c;
      this.cdr.detectChanges();
    });

    this.clipboardService.participantJoined$.pipe(takeUntil(this.destroy$)).subscribe(p => {
      this.showToast(`${p.alias} joined the session`, 'info');
    });

    this.clipboardService.participantLeft$.pipe(takeUntil(this.destroy$)).subscribe(p => {
      this.showToast(`${p.alias} left the session`, 'info');
    });

    this.clipboardService.fileAvailable$.pipe(takeUntil(this.destroy$)).subscribe((file: any) => {
      this.files = [file, ...this.files];
      this.showToast(`New file: ${file.fileName}`, 'info');
      this.cdr.detectChanges();
    });

    this.clipboardService.fileDeleted$.pipe(takeUntil(this.destroy$)).subscribe((fileId: string) => {
      this.files = this.files.filter(f => f.id !== fileId);
      this.cdr.detectChanges();
    });

    this.clipboardService.sessionClosed$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.showToast('Session has been closed', 'info');
      setTimeout(() => {
        this.authService.clear();
        this.router.navigate(['/']);
      }, 2000);
    });

    // Connect SignalR and join session
    try {
      await this.clipboardService.connect();
      await this.clipboardService.joinSession(sessionId, alias);
      this.loadFiles(sessionId);
    } catch (err) {
      console.error('Failed to connect:', err);
      this.showToast('Failed to connect to session', 'info');
    }
  }

  private loadFiles(sessionId: string): void {
    this.fileTransferService.listFiles(sessionId).subscribe({
      next: (files) => this.files = files,
      error: () => { }
    });
  }

  onTextChange(text: string): void {
    this.textChanged.next(text);
  }

  copyAll(): void {
    navigator.clipboard.writeText(this.clipboardText).then(() => {
      this.copySuccess = true;
      setTimeout(() => this.copySuccess = false, 2000);
    });
  }

  clearClipboard(): void {
    if (confirm('Are you sure you want to clear the clipboard and delete all files in this session?')) {
      this.clipboardText = '';
      this.textChanged.next('');

      const sessionId = this.authService.getSessionId();
      if (sessionId && this.files.length > 0) {
        const fileIds = this.files.map(f => f.id);
        fileIds.forEach(id => {
          this.fileTransferService.deleteFile(sessionId, id).subscribe({
            next: () => {
              this.files = this.files.filter(f => f.id !== id);
              this.clipboardService.notifyFileDeleted(sessionId, id);
              this.cdr.detectChanges();
            },
            error: (err) => console.error('Failed to delete file', err)
          });
        });
        this.showToast('Clipboard and files cleared.', 'success');
      } else {
        this.showToast('Clipboard cleared.', 'success');
      }
    }
  }

  // File handling
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        this.uploadFile(files[i]);
      }
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        this.uploadFile(input.files[i]);
      }
    }
  }

  private uploadFile(file: File): void {
    const sessionId = this.authService.getSessionId();
    if (!sessionId) return;

    this.uploadFileName = file.name;
    this.uploadProgress = 0;

    this.fileTransferService.uploadFile(sessionId, file).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round(100 * event.loaded / event.total);
        } else if (event.type === HttpEventType.Response) {
          this.uploadProgress = -1;
          const uploaded = event.body;
          if (uploaded) {
            this.files = [uploaded, ...this.files];
            this.showToast(`Uploaded: ${file.name}`, 'success');
            // Notify other clients via SignalR
            this.clipboardService.notifyFileReady(sessionId, uploaded);
          }
        }
      },
      error: (err: any) => {
        this.uploadProgress = -1;
        this.showToast(`Upload failed: ${err.error?.message || 'Unknown error'}`, 'info');
      }
    });
  }

  getDownloadUrl(publicUrl: string): string {
    return this.fileTransferService.getDownloadUrl(publicUrl);
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  getFileIcon(contentType: string): string {
    if (contentType?.startsWith('image/')) return '🖼️';
    if (contentType?.startsWith('video/')) return '🎬';
    if (contentType?.startsWith('audio/')) return '🎵';
    if (contentType?.includes('pdf')) return '📄';
    if (contentType?.includes('zip') || contentType?.includes('compressed')) return '📦';
    return '📎';
  }

  getAvatarColor(name: string): string {
    const colors = [
      'linear-gradient(135deg, #6366f1, #8b5cf6)',
      'linear-gradient(135deg, #ec4899, #f43f5e)',
      'linear-gradient(135deg, #14b8a6, #06b6d4)',
      'linear-gradient(135deg, #f59e0b, #ef4444)',
      'linear-gradient(135deg, #22c55e, #10b981)',
      'linear-gradient(135deg, #3b82f6, #6366f1)',
    ];
    const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }

  showToast(message: string, type: string): void {
    const toast = { message, type };
    this.toasts.push(toast);
    this.cdr.detectChanges();
    setTimeout(() => {
      const idx = this.toasts.indexOf(toast);
      if (idx >= 0) {
        this.toasts.splice(idx, 1);
        this.cdr.detectChanges();
      }
    }, 4000);
  }

  async leaveSession(): Promise<void> {
    const sessionId = this.authService.getSessionId();
    if (sessionId) {
      await this.clipboardService.leaveSession(sessionId);
    }
    await this.clipboardService.disconnect();
    this.authService.clear();
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.clipboardService.disconnect();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('clipsync-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('clipsync-theme', 'light');
    }
  }
}
