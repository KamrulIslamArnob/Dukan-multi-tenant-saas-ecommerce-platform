using Dukaan.Application.Core.Abstractions;
using Dukaan.Application.Models;
using Dukaan.Domain.Entities;
using ErrorOr;
using Microsoft.EntityFrameworkCore;

namespace Dukaan.Application.Features.Admin.UpdateMerchant;

public class UpdateMerchantHandler(DbContext db)
    : ICommandHandler<UpdateMerchantCommand, ErrorOr<MerchantAdminDto>>
{
    public async Task<ErrorOr<MerchantAdminDto>> Handle(
        UpdateMerchantCommand request,
        CancellationToken cancellationToken)
    {
        var user = await db.Set<ApplicationUser>()
            .FirstOrDefaultAsync(u => u.Id == request.UserId && u.UserType == UserType.Merchant, cancellationToken);
        if (user is null)
            return Error.NotFound("Merchant.NotFound", "Merchant not found.");

        var merchant = await db.Set<Merchant>()
            .FirstOrDefaultAsync(m => m.ApplicationUserId == request.UserId, cancellationToken);
        if (merchant is null)
            return Error.NotFound("Merchant.NotFound", "Merchant not found.");

        var tenant = await db.Set<Tenant>()
            .FirstOrDefaultAsync(t => t.Id == merchant.TenantId, cancellationToken);
        if (tenant is null)
            return Error.NotFound("Merchant.NotFound", "Tenant not found.");

        if (tenant.Slug != request.Slug)
        {
            var slugTenant = await db.Set<Tenant>().AsNoTracking()
                .FirstOrDefaultAsync(t => t.Slug == request.Slug && t.Id != tenant.Id, cancellationToken);
            if (slugTenant is not null)
                return AdminErrors.SlugTaken;
        }

        tenant.StoreName = request.StoreName;
        tenant.Slug = request.Slug;

        await db.SaveChangesAsync(cancellationToken);

        return new MerchantAdminDto(
            user.Id,
            user.Email!,
            tenant.StoreName,
            tenant.Slug,
            user.RegisteredAt,
            await db.Set<Product>().AsNoTracking().IgnoreQueryFilters().CountAsync(p => p.TenantId == tenant.Id, cancellationToken),
            await db.Set<Order>().AsNoTracking().IgnoreQueryFilters().CountAsync(o => o.TenantId == tenant.Id, cancellationToken));
    }
}
