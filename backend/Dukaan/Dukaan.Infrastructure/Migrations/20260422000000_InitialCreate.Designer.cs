using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace Dukaan.Infrastructure.Migrations;

[DbContext(typeof(ApplicationContext))]
[Migration("20260422000000_InitialCreate")]
public partial class InitialCreate : ModelSnapshotBase
{
}
