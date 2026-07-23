using Dukaan.Application.Core.Abstractions;
using Dukaan.Application.Dtos;
using Dukaan.Application.Features.Admin;
using ErrorOr;

namespace Dukaan.Application.Features.Admin.GetAllCustomers;

public sealed record GetAllCustomersQuery(PaginationRequest Pagination)
    : IQuery<ErrorOr<PagedResponse<CustomerAdminDto>>>;
