namespace Dukaan.Infrastructure.Caching;

public class CacheSettings
{
    public int DefaultExpirationMinutes { get; set; } = 5;
    public int ProductListExpirationMinutes { get; set; } = 10;
    public int CategoryExpirationMinutes { get; set; } = 30;
}
