namespace Dukaan.Notification.Application.Features;

using MediatR;

public class DispatchNotificationHandler : IRequestHandler<DispatchNotificationCommand, bool>
{
    private readonly INotificationDispatchManager _dispatchManager;

    public DispatchNotificationHandler(INotificationDispatchManager dispatchManager)
    {
        _dispatchManager = dispatchManager;
    }

    public async Task<bool> Handle(DispatchNotificationCommand request, CancellationToken cancellationToken)
    {
        return await _dispatchManager.DispatchAsync(request.NotificationId, cancellationToken);
    }
}
