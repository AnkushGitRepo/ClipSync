using System.Text;
using System.Threading.RateLimiting;
using ClipSync.API.Hubs;
using ClipSync.API.Middleware;
using ClipSync.Application.Interfaces;
using ClipSync.Application.Services;
using ClipSync.Application.Sessions.Commands;
using ClipSync.Application.Validators;
using ClipSync.Domain.Interfaces;
using ClipSync.Infrastructure.Persistence;
using ClipSync.Infrastructure.Repositories;
using ClipSync.Infrastructure.Storage;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// ─── Database ──────────────────────────────────────────
builder.Services.AddDbContext<ClipSyncDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default") ?? "Data Source=clipsync.db"));

// ─── Repositories ──────────────────────────────────────
builder.Services.AddScoped<ISessionRepository, SessionRepository>();
builder.Services.AddScoped<IParticipantRepository, ParticipantRepository>();
builder.Services.AddScoped<IFileRepository, FileRepository>();

// ─── Services ──────────────────────────────────────────
builder.Services.AddSingleton<IFileStorageService>(new LocalFileStorageService("uploads"));
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();

// ─── MediatR ───────────────────────────────────────────
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateSessionCommand).Assembly));

// ─── FluentValidation ──────────────────────────────────
builder.Services.AddValidatorsFromAssemblyContaining<CreateSessionCommandValidator>();

// ─── JWT Authentication ────────────────────────────────
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "ClipSyncDefaultDevSecret_ChangeInProduction_64chars!!";
var key = Encoding.UTF8.GetBytes(jwtSecret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "ClipSync",
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "ClipSync",
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };

    // SignalR sends JWT via query string
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// ─── CORS ──────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins(
                "http://localhost:4200",
                "http://localhost:4000",
                "https://clipsync.vercel.app")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

// ─── SignalR ───────────────────────────────────────────
builder.Services.AddSignalR(options =>
{
    options.MaximumReceiveMessageSize = 1_048_576; // 1MB
    options.EnableDetailedErrors = builder.Environment.IsDevelopment();
});

// ─── Rate Limiting ─────────────────────────────────────
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 60,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 5
            }));
    options.RejectionStatusCode = 429;
});

// ─── Controllers ───────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

// ─── Ensure DB is created ──────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ClipSyncDbContext>();
    db.Database.EnsureCreated();
}

// ─── Middleware Pipeline ───────────────────────────────
app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseRateLimiter();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ClipboardHub>("/hubs/clipboard");

// ─── Configure port ────────────────────────────────────
app.Urls.Add("http://0.0.0.0:5050");

app.Run();
