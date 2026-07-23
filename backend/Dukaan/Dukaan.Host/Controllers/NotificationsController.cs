namespace Dukaan.Host.Controllers;

using Microsoft.AspNetCore.Mvc;
using MediatR;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : BaseApiController
{
    private readonly IMediator _mediator;

    public NotificationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications([FromQuery] Guid userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var query = new GetNotificationsQuery { UserId = userId, Page = page, PageSize = pageSize };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateNotification([FromBody] CreateNotificationCommand command)
    {
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetNotifications), new { id = result }, result);
    }
}
