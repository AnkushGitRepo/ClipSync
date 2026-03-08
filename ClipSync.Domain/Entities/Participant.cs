namespace ClipSync.Domain.Entities;

public class Participant
{
    public Guid Id { get; private set; }
    public Guid SessionId { get; private set; }
    public string ConnectionId { get; private set; } = string.Empty;
    public string Alias { get; private set; } = string.Empty;
    public DateTime JoinedAt { get; private set; }

    // Navigation property
    public Session Session { get; private set; } = null!;

    private Participant() { } // EF Core constructor

    public static Participant Create(Guid sessionId, string connectionId, string alias)
    {
        return new Participant
        {
            Id = Guid.NewGuid(),
            SessionId = sessionId,
            ConnectionId = connectionId,
            Alias = alias,
            JoinedAt = DateTime.UtcNow
        };
    }
}
