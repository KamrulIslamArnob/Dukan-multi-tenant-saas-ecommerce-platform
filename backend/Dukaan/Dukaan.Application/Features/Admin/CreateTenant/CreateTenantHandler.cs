using Dukaan.Application.Core.Abstractions;
using Dukaan.Domain.Entities;
using ErrorOr;
using Microsoft.EntityFrameworkCore;

namespace Dukaan.Application.Features.Admin.CreateTenant;

public class CreateTenantHandler(DbContext db)
    : ICommandHandler<CreateTenantCommand, ErrorOr<TenantAdminDto>>
{
    public async Task<ErrorOr<TenantAdminDto>> Handle(
        CreateTenantCommand request,
        CancellationToken cancellationToken)
    {
        var existingTenant = await db.Set<Tenant>().AsNoTracking()
            .FirstOrDefaultAsync(t => t.Slug == request.Slug, cancellationToken);

        if (existingTenant is not null)
            return AdminErrors.SlugTaken;

        var tenant = new Tenant
        {
            Id = Guid.NewGuid(),
            StoreName = request.StoreName,
            Slug = request.Slug,
            Category = request.Category.Length > 0 ? request.Category : "General",
            Country = request.Country.Length > 0 ? request.Country : "BD",
            Currency = request.Currency.Length > 0 ? request.Currency : "BDT",
            CreatedAt = DateTime.UtcNow
        };

        db.Set<Tenant>().Add(tenant);
        await db.SaveChangesAsync(cancellationToken);

        return new TenantAdminDto(
            tenant.Id,
            tenant.StoreName,
            tenant.Slug,
            null,
            tenant.CreatedAt,
            0,
            0,
            0);
    }
}
