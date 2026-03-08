namespace ClipSync.Domain.Entities;

public class FileTransfer
{
    public Guid Id { get; private set; }
    public Guid SessionId { get; private set; }
    public string UploadedBy { get; private set; } = string.Empty;
    public string FileName { get; private set; } = string.Empty;
    public string ContentType { get; private set; } = string.Empty;
    public long SizeBytes { get; private set; }
    public string BlobKey { get; private set; } = string.Empty;
    public string PublicUrl { get; private set; } = string.Empty;
    public DateTime ExpiresAt { get; private set; }
    public DateTime UploadedAt { get; private set; }
    public bool IsDeleted { get; private set; }

    // Navigation property
    public Session Session { get; private set; } = null!;

    private FileTransfer() { } // EF Core constructor

    public static FileTransfer Create(
        Guid sessionId,
        string uploadedBy,
        string fileName,
        string contentType,
        long sizeBytes,
        string blobKey,
        string publicUrl,
        int ttlHours = 24)
    {
        return new FileTransfer
        {
            Id = Guid.NewGuid(),
            SessionId = sessionId,
            UploadedBy = uploadedBy,
            FileName = fileName,
            ContentType = contentType,
            SizeBytes = sizeBytes,
            BlobKey = blobKey,
            PublicUrl = publicUrl,
            ExpiresAt = DateTime.UtcNow.AddHours(ttlHours),
            UploadedAt = DateTime.UtcNow,
            IsDeleted = false
        };
    }

    public void MarkDeleted()
    {
        IsDeleted = true;
    }
}
