namespace ClipSync.Application.DTOs;

public record SessionDto(
    Guid Id,
    string Code,
    DateTime CreatedAt,
    DateTime ExpiresAt,
    bool IsActive,
    string CurrentClipboardText,
    List<ParticipantDto> Participants
);

public record ParticipantDto(
    Guid Id,
    string ConnectionId,
    string Alias,
    DateTime JoinedAt
);

public record FileTransferDto(
    Guid Id,
    string FileName,
    string ContentType,
    long SizeBytes,
    string PublicUrl,
    string UploadedBy,
    DateTime UploadedAt,
    DateTime ExpiresAt
);

public record CreateSessionRequest(
    string Alias
);

public record JoinSessionRequest(
    string Code,
    string Alias
);

public record SessionCreatedResponse(
    SessionDto Session,
    string Token,
    string OwnerId
);

public record SessionJoinedResponse(
    SessionDto Session,
    string Token
);
