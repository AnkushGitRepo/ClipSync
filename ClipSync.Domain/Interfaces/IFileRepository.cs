using ClipSync.Domain.Entities;

namespace ClipSync.Domain.Interfaces;

public interface IFileRepository
{
    Task<FileTransfer?> GetByIdAsync(Guid id);
    Task<List<FileTransfer>> GetBySessionIdAsync(Guid sessionId);
    Task<FileTransfer> AddAsync(FileTransfer fileTransfer);
    Task UpdateAsync(FileTransfer fileTransfer);
}
