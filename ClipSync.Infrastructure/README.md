# ClipSync Infrastructure Layer

The `ClipSync.Infrastructure` project implements the data access, file storage, and exterior service dependencies defined by the Application layer. This project handles the physical state persistence and interactions with the host OS or cloud services.

## Responsibilities

*   **Database Persistence**: Implements Entity Framework Core (`DbContext`) and executes SQL migrations.
*   **Repository Implementation**: Provides concrete implementations of the abstract interfaces defined in `ClipSync.Domain`.
*   **File Storage Operations**: Implements the `IFileStorageService` abstraction for raw file blob storage.

## Key Components

### Entity Framework Core
*   **`ClipSyncDbContext`**: The core EF database context configuring `DbSet` tracking for Entities. By default, this is configured for **SQLite** to facilitate rapid local development and testing, though it can easily be swapped out for PostgreSQL or SQL Server via the DI container.
*   **Configurations**: Fluent API mapping configurations (e.g., `SessionConfiguration`) mapping Domain entities tightly to relational table schemas without polluting entity classes with attributes.

### Repositories
*   `SessionRepository`: Asynchronous CRUD implementations for sessions.
*   `ParticipantRepository`: Real-time participant lookups mapped by SignalR Connection Ids.
*   `FileRepository`: Tracks file transfer metadata records.

### Storage Services
*   **`LocalFileStorageService`**: A development-ready implementation of file storage that streams multipart byte streams directly to the local host's disk. Production-ready implementations (e.g., AWS S3, Cloudflare R2) could be implemented alongside this class.

## Dependencies

*   `ClipSync.Domain` & `ClipSync.Application`: For interfaces and entities.
*   `Microsoft.EntityFrameworkCore.Sqlite`: For database persistence.
