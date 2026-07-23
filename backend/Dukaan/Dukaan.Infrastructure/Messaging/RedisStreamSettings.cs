namespace Dukaan.Infrastructure.Messaging;

public class RedisStreamSettings
{
    public string StreamKey { get; set; } = "dukaan:events";
    public string ConsumerGroup { get; set; } = "dukaan-consumers";
    public int MaxRetryCount { get; set; } = 3;
}
