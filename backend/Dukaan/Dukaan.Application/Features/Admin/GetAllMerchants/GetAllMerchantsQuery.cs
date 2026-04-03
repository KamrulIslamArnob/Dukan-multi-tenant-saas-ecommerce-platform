using Dukaan.Application.Core.Abstractions;
using Dukaan.Application.Dtos;
using Dukaan.Application.Features.Admin;
using ErrorOr;

namespace Dukaan.Application.Features.Admin.GetAllMerchants;

public sealed record GetAllMerchantsQuery(PaginationRequest Pagination)
    : IQuery<ErrorOr<PagedResponse<MerchantAdminDto>>>;
