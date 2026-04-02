using Dukaan.Application.Core.Abstractions;
using Dukaan.Domain.Entities;
using Dukaan.Domain.Enums;
using ErrorOr;
using Microsoft.EntityFrameworkCore;

namespace Dukaan.Application.Features.Admin.GetAdminStats;

public class GetAdminStatsHandler(DbContext db)
    : IQueryHandler<GetAdminStatsQuery, ErrorOr<AdminStatsDto>>
{
    public async Task<ErrorOr<AdminStatsDto>> Handle(
        GetAdminStatsQuery request,
        CancellationToken cancellationToken)
    {
        var totalTenants = await db.Set<Tenant>().AsNoTracking().IgnoreQueryFilters()
            .CountAsync(cancellationToken);

        var totalMerchants = await db.Set<Merchant>().AsNoTracking().IgnoreQueryFilters()
            .CountAsync(cancellationToken);

        var totalCustomers = await db.Set<Customer>().AsNoTracking().IgnoreQueryFilters()
            .CountAsync(cancellationToken);

        var totalProducts = await db.Set<Product>().AsNoTracking().IgnoreQueryFilters()
            .CountAsync(cancellationToken);

        var orders = db.Set<Order>().AsNoTracking().IgnoreQueryFilters();
        var totalOrders = await orders.CountAsync(cancellationToken);

        var totalRevenue = await orders
            .Where(o => o.Status != OrderStatus.Cancelled)
            .SumAsync(o => (decimal?)o.Total, cancellationToken) ?? 0;

        var ordersByStatus = await orders
            .GroupBy(o => o.Status)
            .Select(g => new OrderStatusCount(g.Key.ToString(), g.Count()))
            .ToListAsync(cancellationToken);

        var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
        var recentOrders = await orders
            .Where(o => o.CreatedAt >= thirtyDaysAgo && o.Status != OrderStatus.Cancelled)
            .Select(o => new { o.CreatedAt, o.Total })
            .ToListAsync(cancellationToken);

        var revenueLast30Days = recentOrders
            .GroupBy(o => o.CreatedAt.Date)
            .Select(g => new DailyRevenue(g.Key, g.Sum(o => o.Total)))
            .OrderBy(d => d.Date)
            .ToList();

        return new AdminStatsDto(
            totalTenants,
            totalMerchants,
            totalCustomers,
            totalProducts,
            totalOrders,
            totalRevenue,
            ordersByStatus,
            revenueLast30Days);
    }
}
