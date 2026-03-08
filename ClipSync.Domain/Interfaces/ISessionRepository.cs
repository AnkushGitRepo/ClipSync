using ClipSync.Domain.Entities;

namespace ClipSync.Domain.Interfaces;

public interface ISessionRepository
{
    Task<Session?> GetByIdAsync(Guid id);
    Task<Session?> GetByCodeAsync(string code);
    Task<Session> AddAsync(Session session);
    Task UpdateAsync(Session session);
    Task<bool> CodeExistsAsync(string code);
    Task<List<Session>> GetExpiredSessionsAsync();
}
