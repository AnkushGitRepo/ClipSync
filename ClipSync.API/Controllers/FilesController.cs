using ClipSync.Application.DTOs;
using ClipSync.Application.Files.Commands;
using ClipSync.Application.Files.Queries;
using ClipSync.Application.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClipSync.API.Controllers;

[ApiController]
[Route("api/sessions/{sessionId:guid}/files")]
public class FilesController : ControllerBase
{
    private readonly IMediator _mediator;

    public FilesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>Upload a file to a session</summary>
    [HttpPost]
    [Authorize]
    [RequestSizeLimit(52_428_800)] // 50MB
    public async Task<ActionResult<FileTransferDto>> Upload(Guid sessionId, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file provided." });

        var uploadedBy = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "anonymous";

        using var stream = file.OpenReadStream();
        var command = new UploadFileCommand(
            sessionId,
            stream,
            file.FileName,
            file.ContentType,
            file.Length,
            uploadedBy);

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>List all files in a session</summary>
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<List<FileTransferDto>>> List(Guid sessionId)
    {
        var query = new ListFilesQuery(sessionId);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>Delete a file from a session</summary>
    [HttpDelete("{fileId:guid}")]
    [Authorize]
    public async Task<ActionResult> Delete(Guid sessionId, Guid fileId)
    {
        var command = new DeleteFileCommand(fileId, sessionId);
        await _mediator.Send(command);
        return NoContent();
    }
}

/// <summary>Serves locally-stored files for download (dev only)</summary>
[ApiController]
[Route("api/files")]
public class FileDownloadController : ControllerBase
{
    private readonly IFileStorageService _storage;

    public FileDownloadController(IFileStorageService storage)
    {
        _storage = storage;
    }

    [HttpGet("download/{*blobKey}")]
    [AllowAnonymous]
    public async Task<IActionResult> Download(string blobKey)
    {
        var decodedKey = Uri.UnescapeDataString(blobKey);
        var stream = await _storage.DownloadAsync(decodedKey);
        if (stream == null) return NotFound();

        var fileName = Path.GetFileName(decodedKey);
        return File(stream, "application/octet-stream", fileName);
    }
}
