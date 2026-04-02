using Dukaan.Application.Core.Abstractions;
using Dukaan.Application.Features.Admin;
using ErrorOr;

namespace Dukaan.Application.Features.Admin.GetAdminStats;

public sealed record GetAdminStatsQuery : IQuery<ErrorOr<AdminStatsDto>>;
