using Dukaan.Application.Core.Abstractions;
using Dukaan.Application.Dtos;
using Dukaan.Application.Features.Admin;
using ErrorOr;

namespace Dukaan.Application.Features.Admin.GetAllOrders;

public sealed record GetAllOrdersQuery(PaginationRequest Pagination)
    : IQuery<ErrorOr<PagedResponse<AdminOrderSummaryDto>>>;
