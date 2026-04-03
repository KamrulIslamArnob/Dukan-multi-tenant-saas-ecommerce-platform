using Dukaan.Application.Core.Abstractions;
using ErrorOr;

namespace Dukaan.Application.Features.Admin.DeleteMerchant;

public record DeleteMerchantCommand(Guid UserId) : ICommand<ErrorOr<Success>>;
