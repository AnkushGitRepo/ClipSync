namespace ClipSync.Application.Interfaces;

public interface IFileStorageService
{
    Task<(string BlobKey, string PublicUrl)> UploadAsync(Stream fileStream, string fileName, string contentType, Guid sessionId);
    Task DeleteAsync(string blobKey);
    Task<Stream?> DownloadAsync(string blobKey);
}
