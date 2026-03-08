import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionService } from '../../../core/services/session.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-session-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="form-card">
        <button class="back-btn" (click)="goBack()">← Back</button>
        <div class="card-header">
          <h1>Create Session</h1>
          <p>Set up a new shared clipboard space</p>
        </div>

        <div class="form-body" *ngIf="!sessionCode">
          <div class="form-group">
            <label for="alias">Your Display Name</label>
            <input id="alias" type="text" [(ngModel)]="alias" placeholder="e.g. Alice"
                   maxlength="32" class="input" />
          </div>

          <button class="btn-primary" (click)="createSession()" [disabled]="loading || !alias.trim()">
            <span *ngIf="loading" class="spinner"></span>
            {{ loading ? 'Creating...' : 'Create Session' }}
          </button>

          <p *ngIf="error" class="error">{{ error }}</p>
        </div>

        <div class="success-panel" *ngIf="sessionCode">
          <div class="success-icon">✓</div>
          <h2>Session Created!</h2>
          <p class="share-label">Share this code with others:</p>
          <div class="code-display" (click)="copyCode()">
            <span class="code-text">{{ sessionCode }}</span>
            <span class="copy-hint">{{ copied ? '✓ Copied!' : 'Click to copy' }}</span>
          </div>
          <button class="btn-primary" (click)="enterSession()">Enter Session →</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-primary) 100%);
      padding: 2rem;
    }

    .form-card {
      background: var(--bg-tertiary);
      backdrop-filter: blur(20px);
      border: 1px solid var(--border-color);
      border-radius: 24px;
      padding: 2.5rem;
      width: 100%;
      max-width: 460px;
      position: relative;
    }

    .back-btn {
      background: none;
      border: none;
      color: var(--accent-primary);
      cursor: pointer;
      font-size: 0.9rem;
      padding: 0;
      margin-bottom: 1.5rem;
      transition: color 0.2s;
    }
    .back-btn:hover { color: var(--accent-secondary); }

    .card-header { margin-bottom: 2rem; }
    .card-header h1 {
      color: var(--text-primary);
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }
    .card-header p { color: var(--text-secondary); }

    .form-group {
      margin-bottom: 1.5rem;
    }
    .form-group label {
      display: block;
      color: var(--accent-light);
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .input {
      width: 100%;
      padding: 0.75rem 1rem;
      background: var(--bg-hover);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      color: var(--text-primary);
      font-size: 1rem;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      box-sizing: border-box;
    }
    .input:focus {
      border-color: var(--border-focus);
      box-shadow: 0 0 0 3px var(--accent-bg);
    }
    .input::placeholder { color: var(--text-muted); }

    .checkbox {
      margin-right: 0.5rem;
      accent-color: var(--accent-primary);
    }

    .btn-primary {
      width: 100%;
      padding: 0.875rem;
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 25px var(--accent-bg);
    }
    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .error {
      color: var(--danger);
      font-size: 0.85rem;
      margin-top: 1rem;
      text-align: center;
    }

    .success-panel {
      text-align: center;
    }
    .success-icon {
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, var(--success), var(--success));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      font-size: 1.75rem;
      color: white;
    }
    .success-panel h2 {
      color: var(--text-primary);
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .share-label { color: var(--text-secondary); margin-bottom: 1rem; }

    .code-display {
      background: var(--accent-bg);
      border: 2px dashed var(--accent-border);
      border-radius: 16px;
      padding: 1.25rem;
      margin-bottom: 1.5rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .code-display:hover {
      border-color: var(--border-focus);
      background: var(--bg-hover);
    }
    .code-text {
      display: block;
      font-size: 2.5rem;
      font-weight: 800;
      letter-spacing: 0.3em;
      color: var(--accent-secondary);
      font-family: 'Courier New', monospace;
    }
    .copy-hint {
      font-size: 0.8rem;
      color: var(--accent-primary);
      margin-top: 0.25rem;
      display: block;
    }
  `]
})
export class SessionCreateComponent {
  alias = '';

  loading = false;
  error = '';
  sessionCode = '';
  sessionId = '';
  copied = false;

  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  createSession(): void {
    if (!this.alias.trim()) return;
    this.loading = true;
    this.error = '';


    this.sessionService.createSession(this.alias).subscribe({
      next: (response: any) => {
        this.authService.setToken(response.token);
        this.authService.setSessionId(response.session.id);
        this.authService.setOwnerId(response.ownerId);
        this.authService.setAlias(this.alias);
        this.sessionCode = response.session.code;
        this.sessionId = response.session.id;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Failed to create session.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  copyCode(): void {
    navigator.clipboard.writeText(this.sessionCode);
    this.copied = true;
    setTimeout(() => this.copied = false, 2000);
  }

  enterSession(): void {
    this.router.navigate(['/clipboard', this.sessionCode]);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
