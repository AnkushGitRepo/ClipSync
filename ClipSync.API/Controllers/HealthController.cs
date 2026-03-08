using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClipSync.API.Controllers;

[ApiController]
[Route("api/health")]
[AllowAnonymous]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Liveness() => Ok(new { status = "healthy", timestamp = DateTime.UtcNow });

    [HttpGet("ready")]
    public IActionResult Readiness() => Ok(new { status = "ready", timestamp = DateTime.UtcNow });
}
