namespace Dukaan.Notification.Application.Features;

using MediatR;

public record DispatchNotificationCommand : IRequest<bool>
{
    public Guid NotificationId { get; init; }
}
