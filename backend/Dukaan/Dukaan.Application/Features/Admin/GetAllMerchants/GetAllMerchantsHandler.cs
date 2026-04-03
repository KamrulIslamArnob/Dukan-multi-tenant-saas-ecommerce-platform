using Dukaan.Application.Core.Abstractions;
using Dukaan.Application.Dtos;
using Dukaan.Application.Models;
using Dukaan.Domain.Entities;
using ErrorOr;
using Microsoft.EntityFrameworkCore;

namespace Dukaan.Application.Features.Admin.GetAllMerchants;

public class GetAllMerchantsHandler(DbContext db)
    : IQueryHandler<GetAllMerchantsQuery, ErrorOr<PagedResponse<MerchantAdminDto>>>
{
    public async Task<ErrorOr<PagedResponse<MerchantAdminDto>>> Handle(
        GetAllMerchantsQuery request,
        CancellationToken cancellationToken)
    {
        var pagination = request.Pagination;

        var query =
            from u in db.Set<ApplicationUser>().AsNoTracking().IgnoreQueryFilters()
            where u.UserType == UserType.Merchant
            join m in db.Set<Merchant>().AsNoTracking().IgnoreQueryFilters()
                on u.Id equals m.ApplicationUserId
            join t in db.Set<Tenant>().AsNoTracking().IgnoreQueryFilters()
                on m.TenantId equals t.Id
            orderby u.RegisteredAt descending
            select new { u, t };

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((pagination.PageNumber - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .Select(x => new MerchantAdminDto(
                x.u.Id,
                x.u.Email!,
                x.t.StoreName,
                x.t.Slug,
                x.u.RegisteredAt,
                0,
                0
            ))
            .ToListAsync(cancellationToken);

        return new PagedResponse<MerchantAdminDto>(
            items, totalCount, pagination.PageNumber, pagination.PageSize);
    }
}
