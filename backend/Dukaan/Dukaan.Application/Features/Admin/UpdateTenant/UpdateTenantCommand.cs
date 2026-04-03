using Dukaan.Application.Core.Abstractions;
using ErrorOr;

namespace Dukaan.Application.Features.Admin.UpdateTenant;

public record UpdateTenantCommand(
    Guid TenantId,
    string StoreName,
    string Slug,
    string Category,
    string Country,
    string Currency) : ICommand<ErrorOr<TenantAdminDto>>;
