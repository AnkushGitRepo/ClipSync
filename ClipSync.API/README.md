# ClipSync API Project

The `ClipSync.API` project is the entry point and presentation layer of the .NET Core backend. It exposes the Application layer's use cases through RESTful HTTP endpoints and real-time SignalR WebSockets.

## Responsibilities

*   **REST Controllers**: Expose HTTP endpoints mapping directly to MediatR commands/queries.
*   **SignalR Hubs**: Maintain active WebSocket connections allowing real-time duplex communication with the frontend clients.
*   **Dependency Injection (DI)**: Registers all services, repositories, database contexts, and external packages via `Program.cs`.
*   **Middleware Pipeline**: Orchestrates global interceptors for logging, exceptions, CORS, Authentication (JWT), and Rate Limiting.

## Key Components

### Hubs
*   **`ClipboardHub`**: The primary engine driving real-time synchronization. It handles:
    *   Connecting/Disconnecting users.
    *   Broadcasting `ClipboardUpdated` events when users type.
    *   Emitting `ParticipantJoined`/`ParticipantLeft` for presence indicators.
    *   Syncing `FileAvailable` and `FileDeleted` events.

### Controllers
*   **`SessionsController`**: HTTP endpoints for `/api/sessions` (Create, Join, Lookup).
*   **`FilesController`**: Complex multipart form-data endpoint handling streaming file uploads directly to storage, and endpoints for file metadata lists and file deletion.
*   **`HealthController`**: Liveness probe ensuring the server is active.

### Startup & Middleware
*   **Authentication**: Custom JWT Bearer validation capable of dynamically extracting tokens from the `Authorization` header OR WebSocket query strings (`?access_token=...`).
*   **Global Exception Handling**: Returns standardized RFC 7807 `ProblemDetails` generic formatted JSON responses upon unhandled failure.

## Execution
Run this project locally via `dotnet run`. It defaults to port **5050**.
