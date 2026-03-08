using ClipSync.Domain.Entities;
using ClipSync.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace ClipSync.API.Hubs;

[Authorize]
public class ClipboardHub : Hub
{
    private readonly ISessionRepository _sessionRepository;
    private readonly IParticipantRepository _participantRepository;

    public ClipboardHub(ISessionRepository sessionRepository, IParticipantRepository participantRepository)
    {
        _sessionRepository = sessionRepository;
        _participantRepository = participantRepository;
    }

    public async Task JoinSession(string sessionId, string alias)
    {
        if (!Guid.TryParse(sessionId, out var sessionGuid))
        {
            await Clients.Caller.SendAsync("Error", "Invalid session ID.");
            return;
        }

        var session = await _sessionRepository.GetByIdAsync(sessionGuid);
        if (session == null || !session.IsActive || session.IsExpired())
        {
            await Clients.Caller.SendAsync("Error", "Session not found or expired.");
            return;
        }

        // Add participant record
        var participant = Participant.Create(sessionGuid, Context.ConnectionId, alias);
        await _participantRepository.AddAsync(participant);

        // Add to SignalR group
        await Groups.AddToGroupAsync(Context.ConnectionId, sessionId);

        // Send current participant list to the caller
        var participants = await _participantRepository.GetBySessionIdAsync(sessionGuid);
        var participantList = participants.Select(p => new { p.Alias, p.ConnectionId, p.JoinedAt }).ToList();
        await Clients.Caller.SendAsync("CurrentParticipants", participantList);

        // Send current clipboard text to the caller
        await Clients.Caller.SendAsync("ClipboardUpdated", session.CurrentClipboardText, "system");

        // Notify others
        await Clients.OthersInGroup(sessionId).SendAsync("ParticipantJoined", new
        {
            alias,
            connectionId = Context.ConnectionId
        });
    }

    public async Task LeaveSession(string sessionId)
    {
        await RemoveParticipant(sessionId);
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, sessionId);
    }

    public async Task UpdateClipboard(string sessionId, string text)
    {
        if (text.Length > 1_048_576) // 1MB limit
        {
            await Clients.Caller.SendAsync("Error", "Text exceeds the 1MB limit.");
            return;
        }

        // Persist clipboard text
        if (Guid.TryParse(sessionId, out var sessionGuid))
        {
            var session = await _sessionRepository.GetByIdAsync(sessionGuid);
            if (session != null && session.IsActive)
            {
                session.UpdateClipboardText(text);
                await _sessionRepository.UpdateAsync(session);
            }
        }

        // Get sender alias
        var participant = await _participantRepository.GetByConnectionIdAsync(Context.ConnectionId);
        var senderAlias = participant?.Alias ?? "Unknown";

        // Broadcast to all in group (including sender for confirmation)
        await Clients.Group(sessionId).SendAsync("ClipboardUpdated", text, Context.ConnectionId, senderAlias);
    }

    public async Task NotifyFileReady(string sessionId, object fileMetadata)
    {
        await Clients.OthersInGroup(sessionId).SendAsync("FileAvailable", fileMetadata);
    }

    public async Task NotifyFileDeleted(string sessionId, string fileId)
    {
        await Clients.OthersInGroup(sessionId).SendAsync("FileDeleted", fileId);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var participant = await _participantRepository.GetByConnectionIdAsync(Context.ConnectionId);
        if (participant != null)
        {
            var sessionId = participant.SessionId.ToString();
            await _participantRepository.RemoveAsync(participant);

            await Clients.OthersInGroup(sessionId).SendAsync("ParticipantLeft", new
            {
                alias = participant.Alias,
                connectionId = Context.ConnectionId
            });
        }

        await base.OnDisconnectedAsync(exception);
    }

    private async Task RemoveParticipant(string sessionId)
    {
        var participant = await _participantRepository.GetByConnectionIdAsync(Context.ConnectionId);
        if (participant != null)
        {
            await _participantRepository.RemoveAsync(participant);

            await Clients.OthersInGroup(sessionId).SendAsync("ParticipantLeft", new
            {
                alias = participant.Alias,
                connectionId = Context.ConnectionId
            });
        }
    }
}
