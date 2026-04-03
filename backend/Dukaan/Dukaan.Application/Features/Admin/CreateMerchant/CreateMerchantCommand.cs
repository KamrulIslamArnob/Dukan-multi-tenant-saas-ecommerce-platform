using Dukaan.Application.Core.Abstractions;
using ErrorOr;

namespace Dukaan.Application.Features.Admin.CreateMerchant;

public record CreateMerchantCommand(
    string Email,
    string Password,
    Guid TenantId) : ICommand<ErrorOr<MerchantAdminDto>>;
