using Dukaan.Application.Core.Abstractions;
using Dukaan.Application.Dtos;
using Dukaan.Application.Features.Admin;
using ErrorOr;

namespace Dukaan.Application.Features.Admin.GetAllTenants;

public sealed record GetAllTenantsQuery(PaginationRequest Pagination)
    : IQuery<ErrorOr<PagedResponse<TenantAdminDto>>>;
