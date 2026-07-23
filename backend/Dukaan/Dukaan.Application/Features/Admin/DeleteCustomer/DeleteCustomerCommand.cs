using Dukaan.Application.Core.Abstractions;
using ErrorOr;

namespace Dukaan.Application.Features.Admin.DeleteCustomer;

public record DeleteCustomerCommand(Guid UserId) : ICommand<ErrorOr<Success>>;
