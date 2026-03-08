# ClipSync Frontend (Angular)

The `clipsync-frontend` project contains the client-side Single Page Application (SPA) built with Angular 21. It provides a real-time, responsive, and visually polished user interface for interacting with the ClipSync backend.

## Key Technologies

*   **Angular 21**: A modern, standalone-first component architecture.
*   **SignalR Client**: `@microsoft/signalr` for managing real-time WebSocket connections with the .NET backend.
*   **RxJS**: Extensive use of Subjects and Observables for managing state and asynchronous data streams.
*   **Standard CSS & Custom Variables**: Advanced CSS structuring without external UI libraries (e.g. Tailwind) to ensure maximum customizability, featuring a robust Light/Dark mode dynamic theme system.

## Project Structure

*   **`core/`**: Singleton services and interceptors.
    *   `services/`: `AuthService` (JWT), `SessionService` (HTTP), `FileTransferService` (HTTP multipart), and `ClipboardService` (SignalR WebSocket).
    *   `interceptors/`: `auth.interceptor.ts` attaching tokens.
    *   `guards/`: `session.guard.ts` handling route protection and auto-join redirection.
*   **`features/`**: The main routable pages.
    *   `home/`: The landing page with Create/Join CTAs.
    *   `session/create/`: Session creation and alias configuration.
    *   `session/join/`: Joining existing sessions.
    *   `clipboard/`: The core real-time canvas containing the text area, file dragger, and presence indicator.
*   **`shared/`**: Reusable modules or directives (e.g., drag-and-drop file upload).
*   **`environments/`**: API and Hub URL configurations.

## Theming & Advanced SEO

The frontend features dynamic Light/Dark mode toggling driven by CSS variables defined in global `styles.css`. It also injects OpenGraph and Twitter Cards directly into the `index.html` structure to enable rich URL embeds when the platform is shared online.

## Running Locally

1.  Ensure you have Node.js and the Angular CLI installed.
2.  Install dependencies: `npm install`
3.  Start the dev server: `npm start`
4.  Navigate to `http://localhost:4200`
