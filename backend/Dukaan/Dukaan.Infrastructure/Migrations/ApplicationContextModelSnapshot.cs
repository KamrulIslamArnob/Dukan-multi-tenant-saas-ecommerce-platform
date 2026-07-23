using Microsoft.EntityFrameworkCore;
using Dukaan.Domain.Entities;

namespace Dukaan.Infrastructure.Migrations;

public partial class ApplicationContextModelSnapshot : ModelSnapshot
{
    protected override void ModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Price).HasPrecision(18, 2);
        });

        modelBuilder.Entity<Tenant>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
        });
    }
}
