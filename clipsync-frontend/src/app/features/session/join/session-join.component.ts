import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SessionService } from '../../../core/services/session.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-session-join',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="form-card">
        <button class="back-btn" (click)="goBack()">← Back</button>
        <div class="card-header">
          <h1>Join Session</h1>
          <p>Enter the 6-character session code</p>
        </div>

        <div class="form-body">
          <div class="form-group">
            <label for="code">Session Code</label>
            <input id="code" type="text" [(ngModel)]="code" placeholder="e.g. K9XZ2M"
                   maxlength="6" class="input code-input" (input)="code = code.toUpperCase()"
                   autocomplete="off" />
          </div>

          <div class="form-group">
            <label for="alias">Your Display Name</label>
            <input id="alias" type="text" [(ngModel)]="alias" placeholder="e.g. Bob"
                   maxlength="32" class="input" />
          </div>


          <button class="btn-primary" (click)="lookupAndJoin()" [disabled]="loading || code.length < 6 || !alias.trim()">
            <span *ngIf="loading" class="spinner"></span>
            {{ loading ? 'Joining...' : 'Join Session' }}
          </button>

          <p *ngIf="error" class="error">{{ error }}</p>
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

    .form-group { margin-bottom: 1.5rem; }
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

    .code-input {
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-align: center;
      text-transform: uppercase;
      font-family: 'Courier New', monospace;
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
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

    .spinner {
      width: 18px; height: 18px;
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
  `]
})
export class SessionJoinComponent {
  code = '';
  alias = '';

  loading = false;
  error = '';

  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  lookupAndJoin(): void {
    if (this.code.length < 6 || !this.alias.trim()) return;
    this.loading = true;
    this.error = '';

    // First, look up the session by code to check if PIN is needed
    this.sessionService.getSessionByCode(this.code).subscribe({
      next: (session: any) => {
        // Join the session
        this.sessionService.joinSession(session.id, this.code, this.alias).subscribe({
          next: (response: any) => {
            this.authService.setToken(response.token);
            this.authService.setSessionId(response.session.id);
            this.authService.setAlias(this.alias);
            this.loading = false;
            this.cdr.detectChanges();
            this.router.navigate(['/clipboard', this.code.toUpperCase()]);
          },
          error: (err: any) => {
            this.error = err.error?.message || 'Failed to join session.';
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Session not found.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
