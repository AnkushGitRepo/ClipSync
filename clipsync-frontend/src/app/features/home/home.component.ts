import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="home-container">
      <div class="hero-section">
        <div class="animated-bg"></div>
        <div class="content">
          <div class="logo-container">
            <div class="logo-icon">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="4" width="28" height="36" rx="4" stroke="currentColor" stroke-width="2.5" fill="none"/>
                <rect x="12" y="12" width="20" height="3" rx="1.5" fill="currentColor" opacity="0.6"/>
                <rect x="12" y="18" width="16" height="3" rx="1.5" fill="currentColor" opacity="0.4"/>
                <rect x="12" y="24" width="18" height="3" rx="1.5" fill="currentColor" opacity="0.3"/>
                <path d="M32 8L40 16V40C40 42.2091 38.2091 44 36 44H16" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="none"/>
                <circle cx="36" cy="36" r="10" fill="url(#pulse)" stroke="currentColor" stroke-width="2"/>
                <path d="M33 36H39M36 33V39" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <defs>
                  <radialGradient id="pulse">
                    <stop offset="0%" stop-color="rgba(99, 102, 241, 0.3)"/>
                    <stop offset="100%" stop-color="rgba(99, 102, 241, 0.1)"/>
                  </radialGradient>
                </defs>
              </svg>
            </div>
            <h1 class="app-title">ClipSync</h1>
          </div>
          <p class="tagline">Real-time clipboard sharing across devices</p>
          <p class="subtitle">No accounts. No friction. Just paste and share instantly.</p>

          <div class="action-cards">
            <div class="card card-create" (click)="goToCreate()">
              <div class="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v8M8 12h8"/>
                </svg>
              </div>
              <h2>Create Session</h2>
              <p>Start a new shared clipboard and invite others with a 6-digit code</p>
              <span class="card-cta">Get Started →</span>
            </div>

            <div class="card card-join" (click)="goToJoin()">
              <div class="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/>
                </svg>
              </div>
              <h2>Join Session</h2>
              <p>Enter a session code to join an existing shared clipboard</p>
              <span class="card-cta">Enter Code →</span>
            </div>
          </div>

          <div class="features">
            <div class="feature">
              <span class="feature-icon">⚡</span>
              <span>Real-time sync</span>
            </div>
            <div class="feature">
              <span class="feature-icon">📁</span>
              <span>File sharing</span>
            </div>
            <div class="feature">
              <span class="feature-icon">🔒</span>
              <span>PIN protection</span>
            </div>
            <div class="feature">
              <span class="feature-icon">👥</span>
              <span>Live presence</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-primary) 100%);
    }

    .animated-bg {
      position: absolute;
      inset: 0;
      background: 
        radial-gradient(ellipse at 20% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
      animation: bgShift 8s ease-in-out infinite alternate;
    }

    @keyframes bgShift {
      0% { opacity: 0.8; transform: scale(1); }
      100% { opacity: 1; transform: scale(1.05); }
    }

    .content {
      position: relative;
      z-index: 1;
      text-align: center;
      padding: 2rem;
      max-width: 800px;
      width: 100%;
    }

    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .logo-icon {
      width: 56px;
      height: 56px;
      color: var(--accent-primary);
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }

    .app-title {
      font-size: 3.5rem;
      font-weight: 800;
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary), var(--accent-light));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.02em;
    }

    .tagline {
      font-size: 1.25rem;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .subtitle {
      color: var(--text-muted);
      margin-bottom: 3rem;
      font-size: 1rem;
    }

    .action-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .card {
      background: var(--bg-tertiary);
      backdrop-filter: blur(20px);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      padding: 2rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      text-align: left;
    }

    .card:hover {
      transform: translateY(-4px);
      border-color: var(--border-focus);
      box-shadow: 0 20px 60px var(--accent-bg);
    }

    .card-create:hover {
      background: var(--bg-hover);
    }

    .card-join:hover {
      background: var(--bg-hover);
    }

    .card-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .card-icon svg {
      width: 24px;
      height: 24px;
      color: var(--accent-light);
    }

    .card h2 {
      color: var(--text-primary);
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
      font-weight: 700;
    }

    .card p {
      color: var(--text-secondary);
      font-size: 0.9rem;
      line-height: 1.5;
      margin-bottom: 1rem;
    }

    .card-cta {
      color: var(--accent-primary);
      font-weight: 600;
      font-size: 0.9rem;
      transition: color 0.2s;
    }

    .card:hover .card-cta {
      color: var(--accent-secondary);
    }

    .features {
      display: flex;
      justify-content: center;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .feature {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    .feature-icon {
      font-size: 1.2rem;
    }

    @media (max-width: 640px) {
      .action-cards {
        grid-template-columns: 1fr;
      }
      .app-title {
        font-size: 2.5rem;
      }
    }
  `]
})
export class HomeComponent {
  constructor(private router: Router) { }

  goToCreate(): void {
    this.router.navigate(['/session/create']);
  }

  goToJoin(): void {
    this.router.navigate(['/session/join']);
  }
}
