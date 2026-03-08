using ClipSync.Application.DTOs;
using ClipSync.Application.Interfaces;
using ClipSync.Domain.Entities;
using ClipSync.Domain.Interfaces;
using ClipSync.Domain.ValueObjects;
using MediatR;

namespace ClipSync.Application.Sessions.Commands;

// --- Create Session ---
public record CreateSessionCommand(string Alias) : IRequest<SessionCreatedResponse>;

public class CreateSessionCommandHandler : IRequestHandler<CreateSessionCommand, SessionCreatedResponse>
{
    private readonly ISessionRepository _sessionRepository;
    private readonly IJwtTokenService _jwtTokenService;

    public CreateSessionCommandHandler(ISessionRepository sessionRepository, IJwtTokenService jwtTokenService)
    {
        _sessionRepository = sessionRepository;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<SessionCreatedResponse> Handle(CreateSessionCommand request, CancellationToken cancellationToken)
    {
        // Generate unique 6-char code
        string code;
        do
        {
            code = SessionCode.Generate();
        } while (await _sessionRepository.CodeExistsAsync(code));

        var ownerId = Guid.NewGuid().ToString();
        var session = Session.Create(code, ownerId);
        await _sessionRepository.AddAsync(session);

        var token = _jwtTokenService.GenerateOwnerToken(session.Id, ownerId);

        var sessionDto = MapToDto(session);
        return new SessionCreatedResponse(sessionDto, token, ownerId);
    }

    private static SessionDto MapToDto(Session session)
    {
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

// --- Join Session ---
public record JoinSessionCommand(string Code, string Alias) : IRequest<SessionJoinedResponse>;

public class JoinSessionCommandHandler : IRequestHandler<JoinSessionCommand, SessionJoinedResponse>
{
    private readonly ISessionRepository _sessionRepository;
    private readonly IJwtTokenService _jwtTokenService;

    public JoinSessionCommandHandler(ISessionRepository sessionRepository, IJwtTokenService jwtTokenService)
    {
        _sessionRepository = sessionRepository;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<SessionJoinedResponse> Handle(JoinSessionCommand request, CancellationToken cancellationToken)
    {
        var session = await _sessionRepository.GetByCodeAsync(request.Code)
            ?? throw new InvalidOperationException("Session not found or has expired.");

        if (session.IsExpired())
        {
            session.Close();
            await _sessionRepository.UpdateAsync(session);
            throw new InvalidOperationException("Session has expired.");
        }


        var token = _jwtTokenService.GenerateParticipantToken(session.Id, request.Alias);

        var sessionDto = new SessionDto(
            session.Id,
            session.Code,
            session.CreatedAt,
            session.ExpiresAt,
            session.IsActive,
            session.CurrentClipboardText,
            session.Participants.Select(p => new ParticipantDto(p.Id, p.ConnectionId, p.Alias, p.JoinedAt)).ToList()
        );

        return new SessionJoinedResponse(sessionDto, token);
    }
}

// --- Close Session ---
public record CloseSessionCommand(Guid SessionId, string OwnerId) : IRequest<bool>;

public class CloseSessionCommandHandler : IRequestHandler<CloseSessionCommand, bool>
{
    private readonly ISessionRepository _sessionRepository;

    public CloseSessionCommandHandler(ISessionRepository sessionRepository)
    {
        _sessionRepository = sessionRepository;
    }

    public async Task<bool> Handle(CloseSessionCommand request, CancellationToken cancellationToken)
    {
        var session = await _sessionRepository.GetByIdAsync(request.SessionId)
            ?? throw new InvalidOperationException("Session not found.");

        if (session.OwnerId != request.OwnerId)
        {
            throw new UnauthorizedAccessException("Only the session owner can close the session.");
        }

        session.Close();
        await _sessionRepository.UpdateAsync(session);
        return true;
    }
}
