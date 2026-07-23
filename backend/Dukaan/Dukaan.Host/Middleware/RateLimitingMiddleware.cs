namespace Dukaan.Host.Middleware;

using Microsoft.AspNetCore.Http;
using System.Diagnostics;

public class RateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    private static readonly Dictionary<string, RateLimitEntry> _cache = new();
    private static readonly object _lock = new();

    private const int MaxRequestsPerMinute = 60;

    public RateLimitingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var clientId = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

        lock (_lock)
        {
            if (_cache.TryGetValue(clientId, out var entry))
            {
                if (entry.Timestamp.AddMinutes(1) > DateTime.UtcNow)
                {
                    if (entry.Count >= MaxRequestsPerMinute)
                    {
                        context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                        context.Response.Headers.Add("Retry-After", "60");
                        return;
                    }
                    entry.Count++;
                }
                else
                {
                    entry.Timestamp = DateTime.UtcNow;
                    entry.Count = 1;
                }
            }
            else
            {
                _cache[clientId] = new RateLimitEntry { Timestamp = DateTime.UtcNow, Count = 1 };
            }
        }

        await _next(context);
    }

    private class RateLimitEntry
    {
        public DateTime Timestamp { get; set; }
        public int Count { get; set; }
    }
}
