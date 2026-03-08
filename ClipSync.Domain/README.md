# ClipSync Domain Layer

The `ClipSync.Domain` project is the foundation of the ClipSync application, following the principles of Clean Architecture and Domain-Driven Design (DDD). It contains the core enterprise logic, entities, and abstractions that are completely independent of any external frameworks or infrastructure concerns.

## Responsibilities

*   **Enterprise Business Rules**: Defines the core entities and value objects (e.g., `Session`, `Participant`, `FileTransfer`, `SessionCode`).
*   **Repository Interfaces**: Provides abstract interfaces (e.g., `ISessionRepository`, `IParticipantRepository`, `IFileRepository`) that the Application layer depends on. These interfaces are implemented by the Infrastructure layer.
*   **Domain Exceptions**: Defines specific exceptions that can be thrown when domain invariants are violated.

## Key Components

### Entities
*   **`Session`**: Represents a shared clipboard space. Generates a unique 6-character code upon creation and handles active/expiry states.
*   **`Participant`**: Represents a user connected to a specific session via SignalR, mapped through their `ConnectionId` and display `Alias`.
*   **`FileTransfer`**: Tracks files uploaded during a session, monitoring their physical location (BlobKey) and active/deleted statuses.

### Value Objects
*   **`SessionCode`**: A structured value object responsible for securely and randomly generating unambiguous 6-character uppercase codes avoiding confusing characters (like O/0, I/1).

## Dependencies

*   *None*. The Domain layer is the inner-most circle of the architecture. It depends on no other projects within the solution.
