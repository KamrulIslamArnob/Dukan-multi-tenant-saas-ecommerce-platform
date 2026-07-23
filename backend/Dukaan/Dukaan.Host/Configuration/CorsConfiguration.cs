namespace Dukaan.Host.Configuration;

using Microsoft.AspNetCore.Cors.Infrastructure;

public static class CorsConfiguration
{
    private const string PolicyName = "DukaanCorsPolicy";

    public static void ConfigureCors(this IServiceCollection services, IConfiguration configuration)
    {
        var origins = configuration.GetSection("Cors:Origins").Get<string[]>() ?? new[] { "http://localhost:3000" };

        services.AddCors(options =>
        {
            options.AddPolicy(PolicyName, policy =>
            {
                policy.WithOrigins(origins)
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            });
        });
    }

    public static void UseCorsPolicy(this IApplicationBuilder app)
    {
        app.UseCors(PolicyName);
    }
}
