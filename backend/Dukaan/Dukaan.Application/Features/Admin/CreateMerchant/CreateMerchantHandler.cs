using Dukaan.Application.Core.Abstractions;
using Dukaan.Application.Interfaces;
using Dukaan.Domain.Entities;
using ErrorOr;
using Microsoft.EntityFrameworkCore;

namespace Dukaan.Application.Features.Admin.CreateMerchant;

public class CreateMerchantHandler(
    IUserService userService,
    DbContext db)
    : ICommandHandler<CreateMerchantCommand, ErrorOr<MerchantAdminDto>>
{
    public async Task<ErrorOr<MerchantAdminDto>> Handle(
        CreateMerchantCommand request,
        CancellationToken cancellationToken)
    {
        var existingUser = await userService.FindByEmailAsync(request.Email);
        if (existingUser is not null)
            return AdminErrors.EmailTaken;

        var tenant = await db.Set<Tenant>()
            .FirstOrDefaultAsync(t => t.Id == request.TenantId, cancellationToken);
        if (tenant is null)
            return Error.NotFound("Tenant.NotFound", "Tenant not found.");

        var user = await userService.CreateUserAsync(request.Email, request.Password, "Merchant", request.TenantId);
        if (user is null)
            return Error.Validation("Merchant.CreateFailed", "Could not create merchant account.");

        var merchant = new Merchant
        {
            ApplicationUserId = user.Id,
            TenantId = request.TenantId,
        };

        db.Set<Merchant>().Add(merchant);
        await db.SaveChangesAsync(cancellationToken);

        return new MerchantAdminDto(
            user.Id,
            user.Email!,
            tenant.StoreName,
            tenant.Slug,
            user.RegisteredAt,
            0,
            0);
    }
}
