# ClipSync Setup Guide

This guide provides step-by-step instructions to set up the ClipSync environment and run both the .NET backend and the Angular frontend locally.

## Prerequisites

Ensure you have the following installed on your local development machine before attempting to build or run the project:

### 1. .NET 10 SDK (or later)
Required for compiling and running the backend API, C# libraries, and Entity Framework Core migrations.
*   **Download**: [Download .NET SDK](https://dotnet.microsoft.com/download)
*   *Verification*: Open your terminal and run `dotnet --version`

### 2. Node.js (v18.x or later) & npm
Required for managing the Angular frontend dependencies and running the local development server.
*   **Download**: [Download Node.js](https://nodejs.org/)
*   *Verification*: Open your terminal and run `node -v` and `npm -v`

### 3. Angular CLI (v21.x or later)
The command-line interface tool that initializes, develops, scaffolds, and maintains Angular applications.
*   **Installation**: Once Node.js is installed, open your terminal and run:
    ```bash
    npm install -g @angular/cli
    ```
*   *Verification*: Run `ng version`

*Note: The local development environment uses SQLite internally for database persistence to bypass the requirement for installing PostgreSQL or Docker container engines natively.*

---

## 1. Setting Up the Backend (.NET 10)

The backend handles the REST API, SignalR Hubs, Data Persistence, and raw File Storage streams.

1.  Navigate into the project workspace root:
    ```bash
    cd "/Users/ankush/Library/Mobile Documents/com~apple~CloudDocs/Development/DotNet_Project"
    ```

2.  Restore the NuGet packages across all internal projects:
    ```bash
    dotnet restore ClipSync.sln
    ```

3.  Build the entire solution to ensure types map correctly:
    ```bash
    dotnet build ClipSync.sln
    ```

4.  *Optional*: Ensure database migrations are current (SQLite database file `clipsync.db` will be auto-generated in the API folder). Run this from within the API directory if necessary:
    ```bash
    cd ClipSync.API
    dotnet ef database update --project ../ClipSync.Infrastructure
    ```

5.  Run the backend API explicitly:
    ```bash
    dotnet run --project ClipSync.API
    ```

**Verification**: The backend server should spin up and report `Now listening on: http://0.0.0.0:5050`.

---

## 2. Setting Up the Frontend (Angular)

The frontend SPA contains the glassmorphic designs, state observers, and real-time syncing layout.

1.  Open a new terminal tab/window and navigate to the frontend directory:
    ```bash
    cd "/Users/ankush/Library/Mobile Documents/com~apple~CloudDocs/Development/DotNet_Project/clipsync-frontend"
    ```

2.  Install the Node package dependencies:
    ```bash
    npm install
    ```

3.  Start the Angular dev server:
    ```bash
    npm start
    ```
    *(Alternatively, you can run `ng serve`)*

**Verification**: The frontend compiler should finish successfully and report `Application bundle generation complete`.

---

## 3. Usage & Access

1. Open your web browser and navigate to the Angular dev server address:
   **`http://localhost:4200`**

2. You should see the fully animated "ClipSync" landing page. From here, you can click "Create Session".
3. To test the SignalR multiplayer syncing, copy the generated session URL/code and launch a new **Incognito/Private Browser Window** (or an entirely different physical device on your same network), navigate to `localhost:4200`, and join the session!

## Troubleshooting

- **Backend Port Collisions**: If `5050` is in use, modify Port bindings natively inside `/ClipSync.API/Properties/launchSettings.json`.
- **Frontend Port Collisions**: If `4200` is blocked, start the frontend by specifying a port: `ng serve --port 4300`.
- **WebSocket Drops**: Ensure CORS inside the `.NET` `Program.cs` explicitly targets your exact Angular Host Origin and enables `AllowCredentials()`.
