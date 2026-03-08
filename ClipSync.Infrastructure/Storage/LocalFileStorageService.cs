using ClipSync.Application.Interfaces;

namespace ClipSync.Infrastructure.Storage;

public class LocalFileStorageService : IFileStorageService
{
    private readonly string _storagePath;

    public LocalFileStorageService(string storagePath = "uploads")
    {
        _storagePath = Path.GetFullPath(storagePath);
        Directory.CreateDirectory(_storagePath);
    }

    public async Task<(string BlobKey, string PublicUrl)> UploadAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        Guid sessionId)
    {
        var sessionDir = Path.Combine(_storagePath, sessionId.ToString());
        Directory.CreateDirectory(sessionDir);

        var blobKey = $"{sessionId}/{Guid.NewGuid()}_{fileName}";
        var filePath = Path.Combine(_storagePath, blobKey);

        using var outputStream = File.Create(filePath);
        await fileStream.CopyToAsync(outputStream);

        // For local dev, the public URL is served via the API
        var publicUrl = $"/api/files/download/{Uri.EscapeDataString(blobKey)}";
        
        return (blobKey, publicUrl);
    }

    public Task DeleteAsync(string blobKey)
    {
        var filePath = Path.Combine(_storagePath, blobKey);
        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }
        return Task.CompletedTask;
    }

    public Task<Stream?> DownloadAsync(string blobKey)
    {
        var filePath = Path.Combine(_storagePath, blobKey);
        if (!File.Exists(filePath))
        {
            return Task.FromResult<Stream?>(null);
        }
        Stream stream = File.OpenRead(filePath);
        return Task.FromResult<Stream?>(stream);
    }

    public string GetStoragePath() => _storagePath;
}
