using Dukaan.Application.Core.Abstractions;
using Dukaan.Application.Interfaces;
using Dukaan.Domain.Entities;
using ErrorOr;
using Microsoft.EntityFrameworkCore;

namespace Dukaan.Application.Features.Admin.CreateCustomer;

public class CreateCustomerHandler(
    IUserService userService,
    DbContext db)
    : ICommandHandler<CreateCustomerCommand, ErrorOr<CustomerAdminDto>>
{
    public async Task<ErrorOr<CustomerAdminDto>> Handle(
        CreateCustomerCommand request,
        CancellationToken cancellationToken)
    {
        var existingUser = await userService.FindByEmailAsync(request.Email);
        if (existingUser is not null)
            return AdminErrors.EmailTaken;

        var tenant = await db.Set<Tenant>()
            .FirstOrDefaultAsync(t => t.Id == request.TenantId, cancellationToken);
        if (tenant is null)
            return Error.NotFound("Tenant.NotFound", "Tenant not found.");

        var user = await userService.CreateUserAsync(request.Email, request.Password, "Customer", request.TenantId);
        if (user is null)
            return Error.Validation("Customer.CreateFailed", "Could not create customer account.");

        var customer = new Customer
        {
            ApplicationUserId = user.Id,
            TenantId = request.TenantId,
            FirstName = request.FirstName,
            LastName = request.LastName,
        };

        db.Set<Customer>().Add(customer);
        await db.SaveChangesAsync(cancellationToken);

        return new CustomerAdminDto(
            user.Id,
            user.Email!,
            customer.FirstName,
            customer.LastName,
            tenant.Slug,
            user.RegisteredAt,
            0,
            0);
    }
}
