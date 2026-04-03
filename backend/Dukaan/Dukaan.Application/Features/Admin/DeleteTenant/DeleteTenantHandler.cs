using Dukaan.Application.Core.Abstractions;
using Dukaan.Domain.Entities;
using ErrorOr;
using Microsoft.EntityFrameworkCore;

namespace Dukaan.Application.Features.Admin.DeleteTenant;

public class DeleteTenantHandler(DbContext db)
    : ICommandHandler<DeleteTenantCommand, ErrorOr<Success>>
{
    public async Task<ErrorOr<Success>> Handle(
        DeleteTenantCommand request,
        CancellationToken cancellationToken)
    {
        var tenant = await db.Set<Tenant>()
            .FirstOrDefaultAsync(t => t.Id == request.TenantId, cancellationToken);

        if (tenant is null)
            return Error.NotFound("Tenant.NotFound", "Tenant not found.");

        var hasOrders = await db.Set<Order>().AsNoTracking().IgnoreQueryFilters()
            .AnyAsync(o => o.TenantId == request.TenantId, cancellationToken);

        if (hasOrders)
            return Error.Conflict("Tenant.HasOrders", "Cannot delete tenant with existing orders. Cancel orders first.");

        db.Set<Tenant>().Remove(tenant);
        await db.SaveChangesAsync(cancellationToken);

        return Result.Success;
    }
}
