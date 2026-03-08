using ClipSync.Application.DTOs;
using ClipSync.Application.Sessions.Commands;
using ClipSync.Application.Sessions.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClipSync.API.Controllers;

[ApiController]
[Route("api/sessions")]
public class SessionsController : ControllerBase
{
    private readonly IMediator _mediator;

    public SessionsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>Create a new session</summary>
    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult<SessionCreatedResponse>> Create([FromBody] CreateSessionRequest request)
    {
        var command = new CreateSessionCommand(request.Alias);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>Get session info by join code</summary>
    [HttpGet("{code}")]
    [AllowAnonymous]
    public async Task<ActionResult<SessionDto>> GetByCode(string code)
    {
        var query = new GetSessionByCodeQuery(code);
        var result = await _mediator.Send(query);
        if (result == null) return NotFound(new { message = "Session not found." });
        return Ok(result);
    }

    /// <summary>Join an existing session</summary>
    [HttpPost("{id:guid}/join")]
    [AllowAnonymous]
    public async Task<ActionResult<SessionJoinedResponse>> Join(Guid id, [FromBody] JoinSessionRequest request)
    {
        var command = new JoinSessionCommand(request.Code, request.Alias);
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>Close a session (owner only)</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "owner")]
    public async Task<ActionResult> Close(Guid id)
    {
        var ownerId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? throw new UnauthorizedAccessException("Invalid token.");
        
        var command = new CloseSessionCommand(id, ownerId);
        await _mediator.Send(command);
        return NoContent();
    }
}
