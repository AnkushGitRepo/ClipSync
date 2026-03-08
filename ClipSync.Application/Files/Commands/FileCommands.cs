using ClipSync.Application.DTOs;
using ClipSync.Application.Interfaces;
using ClipSync.Domain.Entities;
using ClipSync.Domain.Interfaces;
using MediatR;

namespace ClipSync.Application.Files.Commands;

// --- Upload File ---
public record UploadFileCommand(
    Guid SessionId,
    Stream FileStream,
    string FileName,
    string ContentType,
    long SizeBytes,
    string UploadedBy
) : IRequest<FileTransferDto>;

public class UploadFileCommandHandler : IRequestHandler<UploadFileCommand, FileTransferDto>
{
    private readonly IFileRepository _fileRepository;
    private readonly ISessionRepository _sessionRepository;
    private readonly IFileStorageService _fileStorage;

    private static readonly HashSet<string> BlockedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".exe", ".bat", ".sh", ".ps1", ".msi", ".dll", ".cmd", ".com", ".scr"
    };

    private const long MaxFileSize = 50 * 1024 * 1024; // 50MB

    public UploadFileCommandHandler(
        IFileRepository fileRepository,
        ISessionRepository sessionRepository,
        IFileStorageService fileStorage)
    {
        _fileRepository = fileRepository;
        _sessionRepository = sessionRepository;
        _fileStorage = fileStorage;
    }

    public async Task<FileTransferDto> Handle(UploadFileCommand request, CancellationToken cancellationToken)
    {
        // Validate session exists and is active
        var session = await _sessionRepository.GetByIdAsync(request.SessionId)
            ?? throw new InvalidOperationException("Session not found.");

        if (!session.IsActive || session.IsExpired())
            throw new InvalidOperationException("Session is no longer active.");

        // Validate file size
        if (request.SizeBytes > MaxFileSize)
            throw new InvalidOperationException("File exceeds the maximum size of 50MB.");

        // Validate file type
        var extension = Path.GetExtension(request.FileName);
        if (BlockedExtensions.Contains(extension))
            throw new InvalidOperationException($"File type '{extension}' is not allowed.");

        // Upload to storage
        var (blobKey, publicUrl) = await _fileStorage.UploadAsync(
            request.FileStream,
            request.FileName,
            request.ContentType,
            request.SessionId);

        // Save record
        var fileTransfer = FileTransfer.Create(
            request.SessionId,
            request.UploadedBy,
            request.FileName,
            request.ContentType,
            request.SizeBytes,
            blobKey,
            publicUrl);

        await _fileRepository.AddAsync(fileTransfer);

        return new FileTransferDto(
            fileTransfer.Id,
            fileTransfer.FileName,
            fileTransfer.ContentType,
            fileTransfer.SizeBytes,
            fileTransfer.PublicUrl,
            fileTransfer.UploadedBy,
            fileTransfer.UploadedAt,
            fileTransfer.ExpiresAt);
    }
}

// --- Delete File ---
public record DeleteFileCommand(Guid FileId, Guid SessionId) : IRequest<bool>;

public class DeleteFileCommandHandler : IRequestHandler<DeleteFileCommand, bool>
{
    private readonly IFileRepository _fileRepository;
    private readonly IFileStorageService _fileStorage;

    public DeleteFileCommandHandler(IFileRepository fileRepository, IFileStorageService fileStorage)
    {
        _fileRepository = fileRepository;
        _fileStorage = fileStorage;
    }

    public async Task<bool> Handle(DeleteFileCommand request, CancellationToken cancellationToken)
    {
        var file = await _fileRepository.GetByIdAsync(request.FileId)
            ?? throw new InvalidOperationException("File not found.");

        if (file.SessionId != request.SessionId)
            throw new UnauthorizedAccessException("File does not belong to this session.");

        await _fileStorage.DeleteAsync(file.BlobKey);
        file.MarkDeleted();
        await _fileRepository.UpdateAsync(file);

        return true;
    }
}
