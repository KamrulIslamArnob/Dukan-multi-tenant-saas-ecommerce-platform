using Dukaan.Application.Core.Abstractions;
using Dukaan.Application.Dtos;
using Dukaan.Domain.Entities;
using ErrorOr;
using Microsoft.EntityFrameworkCore;

namespace Dukaan.Application.Features.Admin.GetAllOrders;

public class GetAllOrdersHandler(DbContext db)
    : IQueryHandler<GetAllOrdersQuery, ErrorOr<PagedResponse<AdminOrderSummaryDto>>>
{
    public async Task<ErrorOr<PagedResponse<AdminOrderSummaryDto>>> Handle(
        GetAllOrdersQuery request,
        CancellationToken cancellationToken)
    {
        var pagination = request.Pagination;

        var query =
            from o in db.Set<Order>().AsNoTracking().IgnoreQueryFilters()
            join c in db.Set<Customer>().AsNoTracking().IgnoreQueryFilters()
                on o.CustomerId equals c.Id
            join t in db.Set<Tenant>().AsNoTracking().IgnoreQueryFilters()
                on o.TenantId equals t.Id
            orderby o.CreatedAt descending
            select new { o, c, t };

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((pagination.PageNumber - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .Select(x => new AdminOrderSummaryDto(
                x.o.Id,
                x.o.OrderNumber,
                x.t.StoreName,
                x.c.FirstName + " " + x.c.LastName,
                x.o.Status.ToString(),
                x.o.Total,
                x.o.Items.Count,
                x.o.CreatedAt
            ))
            .ToListAsync(cancellationToken);

        return new PagedResponse<AdminOrderSummaryDto>(
            items, totalCount, pagination.PageNumber, pagination.PageSize);
    }
}
