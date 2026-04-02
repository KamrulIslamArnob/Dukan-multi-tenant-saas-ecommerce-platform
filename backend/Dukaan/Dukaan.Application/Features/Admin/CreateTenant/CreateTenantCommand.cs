using Dukaan.Application.Core.Abstractions;
using ErrorOr;

namespace Dukaan.Application.Features.Admin.CreateTenant;

public record CreateTenantCommand(
    string StoreName,
    string Slug,
    string Category,
    string Country,
    string Currency) : ICommand<ErrorOr<TenantAdminDto>>;
