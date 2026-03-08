using ClipSync.Application.DTOs;
using ClipSync.Domain.Interfaces;
using MediatR;

namespace ClipSync.Application.Sessions.Queries;

public record GetSessionByCodeQuery(string Code) : IRequest<SessionDto?>;

public class GetSessionByCodeQueryHandler : IRequestHandler<GetSessionByCodeQuery, SessionDto?>
{
    private readonly ISessionRepository _sessionRepository;

    public GetSessionByCodeQueryHandler(ISessionRepository sessionRepository)
    {
        _sessionRepository = sessionRepository;
    }

    public async Task<SessionDto?> Handle(GetSessionByCodeQuery request, CancellationToken cancellationToken)
    {
        var session = await _sessionRepository.GetByCodeAsync(request.Code);
        if (session == null) return null;

        return new SessionDto(
            session.Id,
            session.Code,
            session.CreatedAt,
            session.ExpiresAt,
            session.IsActive,
            session.CurrentClipboardText,
            session.Participants.Select(p => new ParticipantDto(p.Id, p.ConnectionId, p.Alias, p.JoinedAt)).ToList()
        );
    }
}
