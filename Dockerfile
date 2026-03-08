# Use the .NET 10 SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy everything in one go (simpler, avoids path/glob issues)
COPY . .

# Restore dependencies
RUN dotnet restore "ClipSync.API/ClipSync.API.csproj"

# Build and publish
RUN dotnet publish "ClipSync.API/ClipSync.API.csproj" -c Release -o /out

# Final runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

COPY --from=build /out .
ENTRYPOINT ["dotnet", "ClipSync.API.dll"]
