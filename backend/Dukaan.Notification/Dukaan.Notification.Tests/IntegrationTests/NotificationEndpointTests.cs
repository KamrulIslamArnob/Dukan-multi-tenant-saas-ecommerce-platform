namespace Dukaan.Notification.Tests.IntegrationTests;

using Xunit;
using Microsoft.AspNetCore.Mvc.Testing;
using System.Net;
using System.Net.Http.Json;

public class NotificationEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public NotificationEndpointTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetNotifications_ReturnsSuccess()
    {
        var response = await _client.GetAsync($"api/notifications?userId={Guid.NewGuid()}");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task CreateNotification_ReturnsCreated()
    {
        var command = new CreateNotificationCommand
        {
            UserId = Guid.NewGuid(),
            Title = "Test",
            Message = "Test notification",
            Type = "system",
            Channels = new[] { "InApp" }
        };

        var response = await _client.PostAsJsonAsync("api/notifications", command);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }
}
