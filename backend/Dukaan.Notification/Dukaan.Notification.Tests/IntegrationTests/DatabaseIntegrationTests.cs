namespace Dukaan.Notification.Tests.IntegrationTests;

using Xunit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

public class DatabaseIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public DatabaseIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Database_CanConnect()
    {
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<NotificationDbContext>();
        var canConnect = await dbContext.Database.CanConnectAsync();
        Assert.True(canConnect);
    }

    [Fact]
    public async Task Notification_CanPersist()
    {
        using var scope = _factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<NotificationDbContext>();

        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Title = "Integration Test",
            Message = "Test message",
            CreatedAt = DateTime.UtcNow
        };

        dbContext.Notifications.Add(notification);
        await dbContext.SaveChangesAsync();

        var retrieved = await dbContext.Notifications.FindAsync(notification.Id);
        Assert.NotNull(retrieved);
        Assert.Equal("Integration Test", retrieved.Title);
    }
}
