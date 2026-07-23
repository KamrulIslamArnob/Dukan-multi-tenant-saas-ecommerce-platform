using Dukaan.Application.Core.Abstractions;
using ErrorOr;

namespace Dukaan.Application.Features.Admin.CancelOrder;

public record CancelOrderCommand(Guid OrderId) : ICommand<ErrorOr<Success>>;
