using ClipSync.Domain.Entities;

namespace ClipSync.Domain.Interfaces;

public interface IParticipantRepository
{
    Task<Participant?> GetByConnectionIdAsync(string connectionId);
    Task<List<Participant>> GetBySessionIdAsync(Guid sessionId);
    Task<Participant> AddAsync(Participant participant);
    Task RemoveAsync(Participant participant);
}
