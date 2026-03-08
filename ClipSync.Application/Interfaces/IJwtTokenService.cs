namespace ClipSync.Application.Interfaces;

public interface IJwtTokenService
{
    string GenerateOwnerToken(Guid sessionId, string ownerId);
    string GenerateParticipantToken(Guid sessionId, string alias);
}
