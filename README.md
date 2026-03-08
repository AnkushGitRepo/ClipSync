# ClipSync

**ClipSync** is an advanced, real-time shared clipboard and file-transfer platform. Unlike traditional cloud storage or messaging apps, ClipSync is built for temporary, instantaneous, and friction-free sharing. Users can generate a 6-character code to create a shared "room", allowing anyone with the code to paste text or upload files that synchronize to all members in under 100 milliseconds.

## Features

- **Real-Time Text Sync:** Powered by SignalR WebSockets, the main clipboard area synchronizes Keystroke-by-keystroke to all connected clients instantly.
- **File & Image Sharing:** Users can drag-and-drop files directly into the browser to upload them to the session.
- **Live Presence Detection:** See exactly who is currently viewing the clipboard with a real-time "Online" indicator sidebar.
- **Auto-Join URL Sharing:** Share deep links (e.g., `/clipboard/UXDBHS`) for instant session onboarding without creating accounts or passing passwords.
- **Responsive Theming:** A dynamic, CSS-variable-driven user interface supporting automated Light and Dark modes.

## Architecture

This project is a high-performance Full-Stack application comprising two main blocks:

1.  **Backend (.NET 10 API):** A strictly layered Clean Architecture CQRS engine running on ASP.NET Core, utilizing `MediatR` for commands/queries, `Entity Framework Core` for persistence, and `SignalR` for WebSockets. See the inner project `README.md` files for deeper architecture dives:
    *   [`ClipSync.Domain`](./ClipSync.Domain/README.md)
    *   [`ClipSync.Application`](./ClipSync.Application/README.md)
    *   [`ClipSync.Infrastructure`](./ClipSync.Infrastructure/README.md)
    *   [`ClipSync.API`](./ClipSync.API/README.md)
    *   [`ClipSync.Tests`](./ClipSync.Tests/README.md)

2.  **Frontend (Angular 21):** A reactive Single Page Application operating heavily on RxJS subjects to map SignalR events seamlessly into the UI template without page reloads.
    *   [`clipsync-frontend`](./clipsync-frontend/README.md)

## Documentation

*   For comprehensive instructions on standing up the local development environment, see the [SETUP_GUIDE.md](./SETUP_GUIDE.md).
