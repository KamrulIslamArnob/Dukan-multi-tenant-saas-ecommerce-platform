using Dukaan.Application.Core.Abstractions;
using Dukaan.Application.Models;
using Dukaan.Domain.Entities;
using ErrorOr;
using Microsoft.EntityFrameworkCore;

namespace Dukaan.Application.Features.Admin.DeleteMerchant;

public class DeleteMerchantHandler(DbContext db)
    : ICommandHandler<DeleteMerchantCommand, ErrorOr<Success>>
{
    public async Task<ErrorOr<Success>> Handle(
        DeleteMerchantCommand request,
        CancellationToken cancellationToken)
    {
        var user = await db.Set<ApplicationUser>()
            .FirstOrDefaultAsync(u => u.Id == request.UserId && u.UserType == UserType.Merchant, cancellationToken);

        if (user is null)
            return Error.NotFound("Merchant.NotFound", "Merchant not found.");

        var merchant = await db.Set<Merchant>()
            .FirstOrDefaultAsync(m => m.ApplicationUserId == request.UserId, cancellationToken);

        if (merchant is not null)
            db.Set<Merchant>().Remove(merchant);

        db.Set<ApplicationUser>().Remove(user);
        await db.SaveChangesAsync(cancellationToken);

        return Result.Success;
    }
}
