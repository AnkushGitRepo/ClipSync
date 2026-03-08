namespace ClipSync.Domain.Entities;

public class Session
{
    public Guid Id { get; private set; }
    public string Code { get; private set; } = string.Empty;

    public string? OwnerId { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime ExpiresAt { get; private set; }
    public bool IsActive { get; private set; }
    public string CurrentClipboardText { get; private set; } = string.Empty;

    // Navigation properties
    public ICollection<Participant> Participants { get; private set; } = new List<Participant>();
    public ICollection<FileTransfer> FileTransfers { get; private set; } = new List<FileTransfer>();

    private Session() { } // EF Core constructor

    public static Session Create(string code, string? ownerId, int ttlHours = 24)
    {
        return new Session
        {
            Id = Guid.NewGuid(),
            Code = code.ToUpperInvariant(),
            OwnerId = ownerId,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddHours(ttlHours),
            IsActive = true,
            CurrentClipboardText = string.Empty
        };
    }

    public void Close()
    {
        IsActive = false;
    }

    public void UpdateClipboardText(string text)
    {
        CurrentClipboardText = text;
    }

    public bool IsExpired() => DateTime.UtcNow >= ExpiresAt;
}
