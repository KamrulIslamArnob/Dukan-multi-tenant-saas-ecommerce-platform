using Dukaan.Application.Core.Abstractions;
using ErrorOr;

namespace Dukaan.Application.Features.Admin.UpdateCustomer;

public record UpdateCustomerCommand(
    Guid UserId,
    string FirstName,
    string LastName) : ICommand<ErrorOr<CustomerAdminDto>>;
