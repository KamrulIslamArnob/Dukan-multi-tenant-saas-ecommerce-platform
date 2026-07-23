namespace Dukaan.Host.HealthChecks;

using Microsoft.Extensions.Diagnostics.HealthChecks;
using StackExchange.Redis;

public class RedisHealthCheck : IHealthCheck
{
    private readonly IConnectionMultiplexer _redis;

    public RedisHealthCheck(IConnectionMultiplexer redis)
    {
        _redis = redis;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            await _redis.GetDatabase().PingAsync();
            return HealthCheckResult.Healthy("Redis is accessible");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Redis is not accessible", ex);
        }
    }
}
