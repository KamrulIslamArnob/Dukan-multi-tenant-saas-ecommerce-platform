namespace Dukaan.Notification.Application.Features;

using MediatR;

public class GetNotificationsHandler : IRequestHandler<GetNotificationsQuery, IReadOnlyList<NotificationDto>>
{
    private readonly INotificationRepository _repository;

    public GetNotificationsHandler(INotificationRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<NotificationDto>> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
    {
        var notifications = await _repository.GetByUserAsync(request.UserId, request.Page, request.PageSize, cancellationToken);
        return notifications.Select(n => new NotificationDto
        {
            Id = n.Id,
            Title = n.Title,
            Message = n.Message,
            IsRead = n.IsRead,
            CreatedAt = n.CreatedAt
        }).ToList();
    }
}
