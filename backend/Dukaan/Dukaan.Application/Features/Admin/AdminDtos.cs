namespace Dukaan.Application.Features.Admin;

public record AdminStatsDto(
    int TotalTenants,
    int TotalMerchants,
    int TotalCustomers,
    int TotalProducts,
    int TotalOrders,
    decimal TotalRevenue,
    List<OrderStatusCount> OrdersByStatus,
    List<DailyRevenue> RevenueLast30Days
);

public record OrderStatusCount(string Status, int Count);

public record DailyRevenue(DateTime Date, decimal Revenue);

public record TenantAdminDto(
    Guid Id,
    string StoreName,
    string Slug,
    string? MerchantEmail,
    DateTime CreatedAt,
    int ProductCount,
    int OrderCount,
    decimal Revenue,
    string Category = "",
    string Country = "",
    string Currency = ""
);

public record MerchantAdminDto(
    Guid Id,
    string Email,
    string StoreName,
    string Slug,
    DateTime RegisteredAt,
    int ProductCount,
    int OrderCount
);

public record CustomerAdminDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string StoreSlug,
    DateTime RegisteredAt,
    int OrderCount,
    decimal TotalSpent
);

public record AdminOrderSummaryDto(
    Guid Id,
    string OrderNumber,
    string StoreName,
    string CustomerName,
    string Status,
    decimal Total,
    int ItemCount,
    DateTime CreatedAt
);
