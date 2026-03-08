using ClipSync.Application.DTOs;
using ClipSync.Domain.Interfaces;
using MediatR;

namespace ClipSync.Application.Files.Queries;

public record ListFilesQuery(Guid SessionId) : IRequest<List<FileTransferDto>>;

public class ListFilesQueryHandler : IRequestHandler<ListFilesQuery, List<FileTransferDto>>
{
    private readonly IFileRepository _fileRepository;

    public ListFilesQueryHandler(IFileRepository fileRepository)
    {
        _fileRepository = fileRepository;
    }

    public async Task<List<FileTransferDto>> Handle(ListFilesQuery request, CancellationToken cancellationToken)
    {
        var files = await _fileRepository.GetBySessionIdAsync(request.SessionId);
        
        return files.Select(f => new FileTransferDto(
            f.Id,
            f.FileName,
            f.ContentType,
            f.SizeBytes,
            f.PublicUrl,
            f.UploadedBy,
            f.UploadedAt,
            f.ExpiresAt
        )).ToList();
    }
}
