# ClipSync Application Layer

The `ClipSync.Application` project implements the CQRS (Command Query Responsibility Segregation) pattern using MediatR to orchestrate the application's specific business rules. It acts as the bridge between the API (presentation) and the Domain/Infrastructure layers.

## Responsibilities

*   **Use Cases**: Coordinates the high-level application logic. Each action a user can take (e.g., creating a session, uploading a file) is encapsulated in a specific Command or Query.
*   **Validation**: Validates incoming requests using `FluentValidation` before they reach the domain entities.
*   **Data Transfer Objects (DTOs)**: Defines the shapes of data returned from the application logic to the presentation layer without leaking domain entities.
*   **Service Interfaces**: Defines abstractions for services that require infrastructure implementations (e.g., `IJwtTokenService`, `IFileStorageService`).

## Key Components

### Commands and Queries (MediatR)
*   **Session Commands/Queries**: 
    *   `CreateSessionCommand`: Generates a new session and returns JWT tokens.
    *   `JoinSessionCommand`: Validates a provided 6-character code and optional PIN.
    *   `CloseSessionCommand`: Marks a session as expired.
    *   `GetSessionByCodeQuery`: Retrieves session details without modifying state.
*   **File Commands/Queries**:
    *   `UploadFileCommand`: Handles secure persistence of files and inserts database records.
    *   `ListFilesQuery`: Retrieves metadata for all files attached to an active session.
    *   `DeleteFileCommand`: Removes a file from storage and database.

### Services
*   `JwtTokenService`: Generates short-lived, encrypted JWTs that securely identify users as either the "Owner" or a "Participant" of a specific session.

## Dependencies

*   `ClipSync.Domain`: For core entities and repository interfaces.
*   `MediatR`: For implementing the CQRS pattern.
*   `FluentValidation`: For business rule and input validation.
