using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ClipSync.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace ClipSync.Application.Services;

public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _configuration;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateOwnerToken(Guid sessionId, string ownerId)
    {
        return GenerateToken(sessionId, ownerId, "owner", TimeSpan.FromHours(24));
    }

    public string GenerateParticipantToken(Guid sessionId, string alias)
    {
        return GenerateToken(sessionId, alias, "participant", TimeSpan.FromMinutes(60));
    }

    private string GenerateToken(Guid sessionId, string subject, string role, TimeSpan expiry)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"] ?? "ClipSyncDefaultDevSecret_ChangeInProduction_64chars!!"));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, subject),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim("sessionId", sessionId.ToString()),
            new Claim(ClaimTypes.Role, role)
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "ClipSync",
            audience: _configuration["Jwt:Audience"] ?? "ClipSync",
            claims: claims,
            expires: DateTime.UtcNow.Add(expiry),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
