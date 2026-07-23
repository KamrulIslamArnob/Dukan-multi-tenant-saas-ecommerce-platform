namespace Dukaan.Infrastructure.Messaging;

using StackExchange.Redis;
using System.Text.Json;
using Dukaan.Application.Interfaces;

public class EventBus : IEventBus
{
    private readonly IConnectionMultiplexer _redis;
    private const string StreamKey = "dukaan:events";

    public EventBus(IConnectionMultiplexer redis)
    {
        _redis = redis;
    }

    public async Task PublishAsync<T>(T @event, CancellationToken ct = default) where T : class
    {
        var db = _redis.GetDatabase();
        var payload = JsonSerializer.Serialize(@event);
        await db.StreamAddAsync(StreamKey, new NameValuePair[] {
            new NameValuePair("type", typeof(T).Name),
            new NameValuePair("payload", payload)
        });
    }
}
