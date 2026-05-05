using Microsoft.AspNetCore.SignalR;
using Dukaan.Notification.Infrastructure.Hubs;
using Dukaan.Notification.Infrastructure.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSignalR()
    .AddStackExchangeRedis(builder.Configuration.GetConnectionString("Redis")!);

builder.Services.AddNotificationInfrastructure(builder.Configuration);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

app.UseHttpsRedirection();
app.UseCors(policy => policy.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());
app.MapHub<NotificationHub>("/hubs/notifications");
app.MapControllers();
app.MapHealthChecks("/health");

app.Run();

public partial class Program { }
