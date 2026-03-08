using ClipSync.Domain.Entities;
using ClipSync.Domain.Interfaces;
using ClipSync.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ClipSync.Infrastructure.Repositories;

public class ParticipantRepository : IParticipantRepository
{
    private readonly ClipSyncDbContext _context;

    public ParticipantRepository(ClipSyncDbContext context)
    {
        _context = context;
    }

    public async Task<Participant?> GetByConnectionIdAsync(string connectionId)
    {
        return await _context.Participants
            .FirstOrDefaultAsync(p => p.ConnectionId == connectionId);
    }

    public async Task<List<Participant>> GetBySessionIdAsync(Guid sessionId)
    {
        return await _context.Participants
            .Where(p => p.SessionId == sessionId)
            .ToListAsync();
    }

    public async Task<Participant> AddAsync(Participant participant)
    {
        _context.Participants.Add(participant);
        await _context.SaveChangesAsync();
        return participant;
    }

    public async Task RemoveAsync(Participant participant)
    {
        _context.Participants.Remove(participant);
        await _context.SaveChangesAsync();
    }
}
