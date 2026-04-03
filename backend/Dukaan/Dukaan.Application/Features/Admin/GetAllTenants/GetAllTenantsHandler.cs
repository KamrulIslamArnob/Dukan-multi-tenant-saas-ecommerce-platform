using Dukaan.Application.Core.Abstractions;
using Dukaan.Application.Dtos;
using Dukaan.Domain.Entities;
using ErrorOr;
using Microsoft.EntityFrameworkCore;

namespace Dukaan.Application.Features.Admin.GetAllTenants;

public class GetAllTenantsHandler(DbContext db)
    : IQueryHandler<GetAllTenantsQuery, ErrorOr<PagedResponse<TenantAdminDto>>>
{
    public async Task<ErrorOr<PagedResponse<TenantAdminDto>>> Handle(
        GetAllTenantsQuery request,
        CancellationToken cancellationToken)
    {
        var pagination = request.Pagination;

        var query =
            from t in db.Set<Tenant>().AsNoTracking().IgnoreQueryFilters()
            join m in db.Set<Merchant>().AsNoTracking().IgnoreQueryFilters()
                on t.Id equals m.TenantId into merchantGroup
            from m in merchantGroup.DefaultIfEmpty()
            join u in db.Set<Application.Models.ApplicationUser>().AsNoTracking().IgnoreQueryFilters()
                on m.ApplicationUserId equals u.Id into userGroup
            from u in userGroup.DefaultIfEmpty()
            orderby t.CreatedAt descending
            select new { t, u };

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((pagination.PageNumber - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .Select(x => new TenantAdminDto(
                x.t.Id,
                x.t.StoreName,
                x.t.Slug,
                x.u != null ? x.u.Email : null,
                x.t.CreatedAt,
                db.Set<Product>().AsNoTracking().IgnoreQueryFilters().Count(p => p.TenantId == x.t.Id),
                db.Set<Order>().AsNoTracking().IgnoreQueryFilters().Count(o => o.TenantId == x.t.Id),
                db.Set<Order>().AsNoTracking().IgnoreQueryFilters()
                    .Where(o => o.TenantId == x.t.Id && o.Status != Domain.Enums.OrderStatus.Cancelled)
                    .Sum(o => (decimal?)o.Total) ?? 0
            ))
            .ToListAsync(cancellationToken);

        return new PagedResponse<TenantAdminDto>(
            items, totalCount, pagination.PageNumber, pagination.PageSize);
    }
}
