import { Routes } from '@angular/router';
import { sessionGuard } from './core/guards/session.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
    },
    {
        path: 'session/create',
        loadComponent: () => import('./features/session/create/session-create.component').then(m => m.SessionCreateComponent)
    },
    {
        path: 'session/join',
        loadComponent: () => import('./features/session/join/session-join.component').then(m => m.SessionJoinComponent)
    },
    {
        path: 'clipboard/:code',
        loadComponent: () => import('./features/clipboard/clipboard.component').then(m => m.ClipboardComponent),
        canActivate: [sessionGuard]
    },
    {
        path: '**',
        redirectTo: ''
    }
];
