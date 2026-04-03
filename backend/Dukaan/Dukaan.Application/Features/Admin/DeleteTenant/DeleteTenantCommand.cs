using Dukaan.Application.Core.Abstractions;
using ErrorOr;

namespace Dukaan.Application.Features.Admin.DeleteTenant;

public record DeleteTenantCommand(Guid TenantId) : ICommand<ErrorOr<Success>>;
