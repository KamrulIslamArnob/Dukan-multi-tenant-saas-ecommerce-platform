namespace Dukaan.Notification.Application.Features;

using MediatR;

public record CreateNotificationCommand : IRequest<Guid>
{
    public Guid UserId { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string[] Channels { get; init; } = Array.Empty<string>();
}
