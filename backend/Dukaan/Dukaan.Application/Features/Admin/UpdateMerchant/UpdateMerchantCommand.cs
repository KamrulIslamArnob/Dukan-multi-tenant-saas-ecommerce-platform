using Dukaan.Application.Core.Abstractions;
using ErrorOr;

namespace Dukaan.Application.Features.Admin.UpdateMerchant;

public record UpdateMerchantCommand(
    Guid UserId,
    string StoreName,
    string Slug) : ICommand<ErrorOr<MerchantAdminDto>>;
