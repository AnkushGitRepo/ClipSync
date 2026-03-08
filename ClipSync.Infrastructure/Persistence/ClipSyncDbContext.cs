using ClipSync.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ClipSync.Infrastructure.Persistence;

public class ClipSyncDbContext : DbContext
{
    public DbSet<Session> Sessions => Set<Session>();
    public DbSet<Participant> Participants => Set<Participant>();
    public DbSet<FileTransfer> FileTransfers => Set<FileTransfer>();

    public ClipSyncDbContext(DbContextOptions<ClipSyncDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Session configuration
        modelBuilder.Entity<Session>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Code).HasMaxLength(6).IsRequired();
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.OwnerId).HasMaxLength(256);
            entity.Property(e => e.CurrentClipboardText).HasMaxLength(1048576); // 1MB
            entity.Property(e => e.CreatedAt).IsRequired();
            entity.Property(e => e.ExpiresAt).IsRequired();
            entity.Property(e => e.IsActive).IsRequired().HasDefaultValue(true);

            entity.HasMany(e => e.Participants)
                .WithOne(p => p.Session)
                .HasForeignKey(p => p.SessionId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.FileTransfers)
                .WithOne(f => f.Session)
                .HasForeignKey(f => f.SessionId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Participant configuration
        modelBuilder.Entity<Participant>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ConnectionId).HasMaxLength(256).IsRequired();
            entity.Property(e => e.Alias).HasMaxLength(32).IsRequired();
            entity.Property(e => e.JoinedAt).IsRequired();
            entity.HasIndex(e => e.ConnectionId);
        });

        // FileTransfer configuration
        modelBuilder.Entity<FileTransfer>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UploadedBy).HasMaxLength(256).IsRequired();
            entity.Property(e => e.FileName).HasMaxLength(512).IsRequired();
            entity.Property(e => e.ContentType).HasMaxLength(256).IsRequired();
            entity.Property(e => e.SizeBytes).IsRequired();
            entity.Property(e => e.BlobKey).HasMaxLength(512).IsRequired();
            entity.Property(e => e.PublicUrl).HasMaxLength(2048).IsRequired();
            entity.Property(e => e.ExpiresAt).IsRequired();
            entity.Property(e => e.UploadedAt).IsRequired();
            entity.Property(e => e.IsDeleted).IsRequired().HasDefaultValue(false);
        });
    }
}
