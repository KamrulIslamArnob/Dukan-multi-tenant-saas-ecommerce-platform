namespace Dukaan.Notification.Application.Features;

using MediatR;

public class CreateNotificationHandler : IRequestHandler<CreateNotificationCommand, Guid>
{
    private readonly INotificationRepository _repository;

    public CreateNotificationHandler(INotificationRepository repository)
    {
        _repository = repository;
    }

    public async Task<Guid> Handle(CreateNotificationCommand request, CancellationToken cancellationToken)
    {
        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            Title = request.Title,
            Message = request.Message,
            Type = request.Type,
            Channels = request.Channels.Select(Enum.Parse<NotificationChannelType>).ToArray(),
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };

        await _repository.AddAsync(notification, cancellationToken);
        await _repository.SaveAsync(cancellationToken);

        return notification.Id;
    }
}
