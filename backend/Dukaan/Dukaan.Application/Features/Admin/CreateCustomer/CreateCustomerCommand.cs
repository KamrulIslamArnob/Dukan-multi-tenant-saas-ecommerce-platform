using Dukaan.Application.Core.Abstractions;
using ErrorOr;

namespace Dukaan.Application.Features.Admin.CreateCustomer;

public record CreateCustomerCommand(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    Guid TenantId) : ICommand<ErrorOr<CustomerAdminDto>>;
