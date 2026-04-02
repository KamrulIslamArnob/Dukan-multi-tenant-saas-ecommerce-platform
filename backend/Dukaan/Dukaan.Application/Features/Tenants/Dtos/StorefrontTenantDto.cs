namespace Dukaan.Application.Features.Tenants.Dtos;

public record StorefrontTenantDto(
    Guid Id,
    string StoreName,
    string Slug,
    string? Category,
    string? Country,
    string Currency
);