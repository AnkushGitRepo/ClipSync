# Use the .NET 10 SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app/src

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
WORKDIR "/app/src/ClipSync.API"
RUN dotnet publish "ClipSync.API.csproj" -c Release -o /app/publish

# Final runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ClipSync.API.dll"]
