# ClipSync Tests

The `ClipSync.Tests` project is the dedicated testing suite for the ClipSync backend. While currently scaffolded as a placeholder, this project is designed to contain unit tests, integration tests, and potentially functional tests for the .NET components.

## Planned Structure

*   **Unit Tests**: Isolated tests targeting individual classes or methods, primarily in the `ClipSync.Domain` and `ClipSync.Application` layers. This involves testing command/query logic heavily using mocking frameworks (like `Moq` or `NSubstitute`) to decouple dependencies.
*   **Integration Tests**: Tests that verify the interaction between multiple components, often involving the `ClipSync.Infrastructure` layer connecting to an in-memory test database (SQLite in-memory) to validate EF Core mappings and repository operations.
*   **API Tests**: High-level contract tests using `WebApplicationFactory` to spin up a test server and validate the HTTP endpoints and SignalR Hub responses.

## Key Testing Frameworks (Recommended)

When populated, this project should utilize:
*   `xUnit`: The core testing framework.
*   `FluentAssertions`: For readable, expressive assertions.
*   `Moq`: For creating mock objects and verifying interactions.
*   `Microsoft.AspNetCore.Mvc.Testing`: For in-memory integration testing of the API layer.
