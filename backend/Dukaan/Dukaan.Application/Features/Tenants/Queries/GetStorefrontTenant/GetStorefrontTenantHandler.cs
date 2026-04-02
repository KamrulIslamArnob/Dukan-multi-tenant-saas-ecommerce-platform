using ErrorOr;
using Dukaan.Domain.Entities;
using Dukaan.Application.Interfaces;
using Dukaan.Application.Core.Abstractions;
using Dukaan.Application.Features.Tenants.Dtos;

namespace Dukaan.Application.Features.Tenants.Queries.GetStorefrontTenant;

public class GetStorefrontTenantHandler(IRepository<Tenant> repository)
    : IQueryHandler<GetStorefrontTenantQuery, ErrorOr<StorefrontTenantDto>>
{
    public async Task<ErrorOr<StorefrontTenantDto>> Handle(GetStorefrontTenantQuery request, CancellationToken cancellationToken)
    {
        var result = await repository.FindAsync(t => t.Slug == request.Slug, trackChanges: false, cancellationToken: cancellationToken);
        var tenant = result.FirstOrDefault();
        if (tenant is null) return TenantErrors.NotFound;

        return new StorefrontTenantDto(
            tenant.Id,
            tenant.StoreName,
            tenant.Slug,
            tenant.Category,
            tenant.Country,
            tenant.Currency
        );
    }
}