# ClipSync Free Deployment Guide

Deploying a full-stack .NET and Angular application for free is entirely possible using modern platform-as-a-service (PaaS) providers. Because ClipSync is split into a frontend SPA and a backend API, we will deploy them separately to the platforms best suited for each.

---

## 1. Frontend (Angular) Free Deployment

Angular applications compile down to static HTML/CSS/JS files, which means they can be hosted on premium global CDNs completely for free.

**Recommended Platform**: [Vercel](https://vercel.com) or [Netlify](https://netlify.com)

### Steps for Vercel:
1.  **Preparation**: Ensure your `clipsync-frontend` code is pushed to a GitHub repository.
2.  **Account**: Create a free Hobby account at Vercel and link your GitHub.
3.  **Import**: Click **Add New** -> **Project** and import your repository.
4.  **Configuration**:
    *   **Framework Preset**: Select "Angular".
    *   **Root Directory**: Set this to `clipsync-frontend` (if your repo contains the backend as well).
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist/clipsync-frontend/browser`
5.  **Environment Variables**:
    You need to tell the Angular app where your backend will live. Add these variables (you will update these URLs after you deploy the backend in step 2):
    *   `PRODUCTION`: `true`
    *   `API_URL`: `https://your-backend-url.onrender.com/api`
    *   `HUB_URL`: `https://your-backend-url.onrender.com/hubs/clipboard`
6.  **Deploy**: Click Deploy. Vercel will build the Angular app and give you a free `your-app.vercel.app` URL.

---

## 2. Backend (.NET 10 Web API) Free Deployment

Hosting a .NET API requires a server environment to run the runtime. Several providers offer generous free tiers for Web Services.

**Recommended Platform**: [Render](https://render.com) or [Railway](https://railway.app) (Railway offers a free trial credit system)

### Steps for Render (Free Tier):
1.  **Preparation**: Make sure your .NET API code (the root of the project with `.sln`) is pushed to GitHub.
2.  **Account**: Create a free Render account and link GitHub.
3.  **New Web Service**: Click **New +** -> **Web Service**.
4.  **Connect Repo**: Select your ClipSync repository.
5.  **Configuration**:
    *   **Environment**: Select `Docker` (Render automatically builds Dockerfiles, which is the easiest way to deploy .NET).
        *   *Note*: Since we haven't created a Dockerfile yet, you'd need to add a standard ASP.NET Core Dockerfile to your repo root before pushing. **See below for the Dockerfile.**
    *   **Instance Type**: Select **Free**.
6.  **Advanced Configurations**:
    *   **Environment Variables**:
        *   `ASPNETCORE_ENVIRONMENT`: `Production`
    *   **Disk**: Render's free tier has an ephemeral disk (files upload wipe on restart). For a true free deployment that keeps files permanently, you'd need to implement an AWS S3 free tier or Cloudflare R2 bucket and pass the connection strings here. Currently, with SQLite and Local Disk Storage, the database and files will reset when Render puts the free service to sleep.
7.  **Deploy**: Render will build the Docker image and deploy it. It will give you a URL like `https://clipsync-api-xyz.onrender.com`.

### Important Considerations for the Free Backend

*   **Cold Starts**: Free tiers on Render/Railway "spin down" after 15 minutes of inactivity. When the next request comes in, it might take 30-50 seconds to spin back up.
*   **Ephemeral Storage**: On Render, free tier disks are wiped on restart. **This means your SQLite Database and Uploaded Files will be deleted** every time the server spins down.
*   **Production Fix**: To prevent this while staying free, transition from SQLite/Local Disk to:
    1.  **Database**: Supabase (Free PostgreSQL) or clever-cloud.
    2.  **File Storage**: Cloudflare R2 (10GB Free/month) or Amazon S3 Free Tier.

---

## Appendix: Required Dockerfile for Render

To deploy the .NET backend to Render, place this file named exactly `Dockerfile` in the root of your project (same folder as `ClipSync.sln`):

```dockerfile
# Use the .NET 10 SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy the solution and project files first
COPY ["ClipSync.sln", "./"]
COPY ["ClipSync.API/ClipSync.API.csproj", "ClipSync.API/"]
COPY ["ClipSync.Application/ClipSync.Application.csproj", "ClipSync.Application/"]
COPY ["ClipSync.Domain/ClipSync.Domain.csproj", "ClipSync.Domain/"]
COPY ["ClipSync.Infrastructure/ClipSync.Infrastructure.csproj", "ClipSync.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "ClipSync.API/ClipSync.API.csproj"

# Copy the rest of the code
COPY . .

# Build and publish
WORKDIR "/src/ClipSync.API"
RUN dotnet publish "ClipSync.API.csproj" -c Release -o /app/publish

# Final runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ClipSync.API.dll"]
```
