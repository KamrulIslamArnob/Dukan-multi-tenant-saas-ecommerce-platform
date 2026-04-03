using Dukaan.Application.Core.Abstractions;
using Dukaan.Domain.Entities;
using ErrorOr;
using Microsoft.EntityFrameworkCore;

namespace Dukaan.Application.Features.Admin.UpdateTenant;

public class UpdateTenantHandler(DbContext db)
    : ICommandHandler<UpdateTenantCommand, ErrorOr<TenantAdminDto>>
{
    public async Task<ErrorOr<TenantAdminDto>> Handle(
        UpdateTenantCommand request,
        CancellationToken cancellationToken)
    {
        var tenant = await db.Set<Tenant>()
            .FirstOrDefaultAsync(t => t.Id == request.TenantId, cancellationToken);

        if (tenant is null)
            return Error.NotFound("Tenant.NotFound", "Tenant not found.");

        if (tenant.Slug != request.Slug)
        {
            var slugTenant = await db.Set<Tenant>().AsNoTracking()
                .FirstOrDefaultAsync(t => t.Slug == request.Slug && t.Id != request.TenantId, cancellationToken);
            if (slugTenant is not null)
                return AdminErrors.SlugTaken;
        }

        tenant.StoreName = request.StoreName;
        tenant.Slug = request.Slug;
        tenant.Category = request.Category;
        tenant.Country = request.Country;
        tenant.Currency = request.Currency;

        await db.SaveChangesAsync(cancellationToken);

        return new TenantAdminDto(
            tenant.Id,
            tenant.StoreName,
            tenant.Slug,
            null,
            tenant.CreatedAt,
            await db.Set<Product>().AsNoTracking().IgnoreQueryFilters().CountAsync(p => p.TenantId == tenant.Id, cancellationToken),
            await db.Set<Order>().AsNoTracking().IgnoreQueryFilters().CountAsync(o => o.TenantId == tenant.Id, cancellationToken),
            await db.Set<Order>().AsNoTracking().IgnoreQueryFilters()
                .Where(o => o.TenantId == tenant.Id && o.Status != Domain.Enums.OrderStatus.Cancelled)
                .SumAsync(o => (decimal?)o.Total, cancellationToken) ?? 0,
            tenant.Category,
            tenant.Country,
            tenant.Currency);
    }
}
