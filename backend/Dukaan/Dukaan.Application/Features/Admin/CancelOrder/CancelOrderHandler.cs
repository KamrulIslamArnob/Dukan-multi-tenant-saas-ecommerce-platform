using Dukaan.Application.Core.Abstractions;
using Dukaan.Domain.Entities;
using Dukaan.Domain.Enums;
using ErrorOr;
using Microsoft.EntityFrameworkCore;

namespace Dukaan.Application.Features.Admin.CancelOrder;

public class CancelOrderHandler(DbContext db)
    : ICommandHandler<CancelOrderCommand, ErrorOr<Success>>
{
    public async Task<ErrorOr<Success>> Handle(
        CancelOrderCommand request,
        CancellationToken cancellationToken)
    {
        var order = await db.Set<Order>().IgnoreQueryFilters()
            .FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);

        if (order is null)
            return Error.NotFound("Order.NotFound", "Order not found.");

        if (order.Status == OrderStatus.Cancelled)
            return Error.Conflict("Order.AlreadyCancelled", "Order is already cancelled.");

        order.Status = OrderStatus.Cancelled;

        await db.SaveChangesAsync(cancellationToken);

        return Result.Success;
    }
}
