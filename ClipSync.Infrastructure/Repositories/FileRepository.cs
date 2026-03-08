using ClipSync.Domain.Entities;
using ClipSync.Domain.Interfaces;
using ClipSync.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ClipSync.Infrastructure.Repositories;

public class FileRepository : IFileRepository
{
    private readonly ClipSyncDbContext _context;

    public FileRepository(ClipSyncDbContext context)
    {
        _context = context;
    }

    public async Task<FileTransfer?> GetByIdAsync(Guid id)
    {
        return await _context.FileTransfers.FirstOrDefaultAsync(f => f.Id == id && !f.IsDeleted);
    }

    public async Task<List<FileTransfer>> GetBySessionIdAsync(Guid sessionId)
    {
        return await _context.FileTransfers
            .Where(f => f.SessionId == sessionId && !f.IsDeleted && f.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(f => f.UploadedAt)
            .ToListAsync();
    }

    public async Task<FileTransfer> AddAsync(FileTransfer fileTransfer)
    {
        _context.FileTransfers.Add(fileTransfer);
        await _context.SaveChangesAsync();
        return fileTransfer;
    }

    public async Task UpdateAsync(FileTransfer fileTransfer)
    {
        _context.FileTransfers.Update(fileTransfer);
        await _context.SaveChangesAsync();
    }
}
