using ClipSync.Domain.Entities;
using ClipSync.Domain.Interfaces;
using ClipSync.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ClipSync.Infrastructure.Repositories;

public class SessionRepository : ISessionRepository
{
    private readonly ClipSyncDbContext _context;

    public SessionRepository(ClipSyncDbContext context)
    {
        _context = context;
    }

    public async Task<Session?> GetByIdAsync(Guid id)
    {
        return await _context.Sessions
            .Include(s => s.Participants)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<Session?> GetByCodeAsync(string code)
    {
        return await _context.Sessions
            .Include(s => s.Participants)
            .FirstOrDefaultAsync(s => s.Code == code.ToUpperInvariant() && s.IsActive);
    }

    public async Task<Session> AddAsync(Session session)
    {
        _context.Sessions.Add(session);
        await _context.SaveChangesAsync();
        return session;
    }

    public async Task UpdateAsync(Session session)
    {
        _context.Sessions.Update(session);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> CodeExistsAsync(string code)
    {
        return await _context.Sessions.AnyAsync(s => s.Code == code.ToUpperInvariant());
    }

    public async Task<List<Session>> GetExpiredSessionsAsync()
    {
        return await _context.Sessions
            .Where(s => s.IsActive && s.ExpiresAt <= DateTime.UtcNow)
            .ToListAsync();
    }
}
