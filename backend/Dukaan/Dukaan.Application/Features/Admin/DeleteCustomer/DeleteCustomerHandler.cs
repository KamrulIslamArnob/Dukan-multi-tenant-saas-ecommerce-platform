using Dukaan.Application.Core.Abstractions;
using Dukaan.Application.Models;
using Dukaan.Domain.Entities;
using ErrorOr;
using Microsoft.EntityFrameworkCore;

namespace Dukaan.Application.Features.Admin.DeleteCustomer;

public class DeleteCustomerHandler(DbContext db)
    : ICommandHandler<DeleteCustomerCommand, ErrorOr<Success>>
{
    public async Task<ErrorOr<Success>> Handle(
        DeleteCustomerCommand request,
        CancellationToken cancellationToken)
    {
        var user = await db.Set<ApplicationUser>()
            .FirstOrDefaultAsync(u => u.Id == request.UserId && u.UserType == UserType.Customer, cancellationToken);

        if (user is null)
            return Error.NotFound("Customer.NotFound", "Customer not found.");

        var customer = await db.Set<Customer>()
            .FirstOrDefaultAsync(c => c.ApplicationUserId == request.UserId, cancellationToken);

        if (customer is not null)
            db.Set<Customer>().Remove(customer);

        db.Set<ApplicationUser>().Remove(user);
        await db.SaveChangesAsync(cancellationToken);

        return Result.Success;
    }
}
