using Dukaan.Application.Core.Abstractions;
using ErrorOr;
using Dukaan.Application.Features.Tenants.Dtos;

namespace Dukaan.Application.Features.Tenants.Queries.GetStorefrontTenant;

public record GetStorefrontTenantQuery(string Slug) : IQuery<ErrorOr<StorefrontTenantDto>>;