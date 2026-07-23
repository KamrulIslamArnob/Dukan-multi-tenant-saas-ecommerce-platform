using Dukaan.Application.Core.Abstractions;
using Dukaan.Application.Dtos;
using Dukaan.Application.Models;
using Dukaan.Domain.Entities;
using ErrorOr;
using Microsoft.EntityFrameworkCore;

namespace Dukaan.Application.Features.Admin.GetAllCustomers;

public class GetAllCustomersHandler(DbContext db)
    : IQueryHandler<GetAllCustomersQuery, ErrorOr<PagedResponse<CustomerAdminDto>>>
{
    public async Task<ErrorOr<PagedResponse<CustomerAdminDto>>> Handle(
        GetAllCustomersQuery request,
        CancellationToken cancellationToken)
    {
        var pagination = request.Pagination;

        var query =
            from u in db.Set<ApplicationUser>().AsNoTracking().IgnoreQueryFilters()
            where u.UserType == UserType.Customer
            join c in db.Set<Customer>().AsNoTracking().IgnoreQueryFilters()
                on u.Id equals c.ApplicationUserId
            join t in db.Set<Tenant>().AsNoTracking().IgnoreQueryFilters()
                on c.TenantId equals t.Id
            orderby u.RegisteredAt descending
            select new { u, c, t };

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((pagination.PageNumber - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .Select(x => new CustomerAdminDto(
                x.u.Id,
                x.u.Email!,
                x.c.FirstName,
                x.c.LastName,
                x.t.Slug,
                x.u.RegisteredAt,
                0,
                0
            ))
            .ToListAsync(cancellationToken);

        return new PagedResponse<CustomerAdminDto>(
            items, totalCount, pagination.PageNumber, pagination.PageSize);
    }
}
