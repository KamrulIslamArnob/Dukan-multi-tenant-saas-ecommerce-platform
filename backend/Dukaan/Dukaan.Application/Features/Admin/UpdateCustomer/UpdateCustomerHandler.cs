using Dukaan.Application.Core.Abstractions;
using Dukaan.Application.Models;
using Dukaan.Domain.Entities;
using ErrorOr;
using Microsoft.EntityFrameworkCore;

namespace Dukaan.Application.Features.Admin.UpdateCustomer;

public class UpdateCustomerHandler(DbContext db)
    : ICommandHandler<UpdateCustomerCommand, ErrorOr<CustomerAdminDto>>
{
    public async Task<ErrorOr<CustomerAdminDto>> Handle(
        UpdateCustomerCommand request,
        CancellationToken cancellationToken)
    {
        var user = await db.Set<ApplicationUser>()
            .FirstOrDefaultAsync(u => u.Id == request.UserId && u.UserType == UserType.Customer, cancellationToken);
        if (user is null)
            return Error.NotFound("Customer.NotFound", "Customer not found.");

        var customer = await db.Set<Customer>()
            .FirstOrDefaultAsync(c => c.ApplicationUserId == request.UserId, cancellationToken);
        if (customer is null)
            return Error.NotFound("Customer.NotFound", "Customer not found.");

        customer.FirstName = request.FirstName;
        customer.LastName = request.LastName;

        await db.SaveChangesAsync(cancellationToken);

        var tenant = await db.Set<Tenant>().AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == customer.TenantId, cancellationToken);

        return new CustomerAdminDto(
            user.Id,
            user.Email!,
            customer.FirstName,
            customer.LastName,
            tenant?.Slug ?? "",
            user.RegisteredAt,
            await db.Set<Order>().AsNoTracking().IgnoreQueryFilters().CountAsync(o => o.CustomerId == customer.Id, cancellationToken),
            await db.Set<Order>().AsNoTracking().IgnoreQueryFilters()
                .Where(o => o.CustomerId == customer.Id)
                .SumAsync(o => (decimal?)o.Total, cancellationToken) ?? 0);
    }
}
