namespace Dukaan.Infrastructure.Data.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Dukaan.Domain.Entities;

public class MerchantConfiguration : IEntityTypeConfiguration<Merchant>
{
    public void Configure(EntityTypeBuilder<Merchant> builder)
    {
        builder.HasKey(m => m.Id);
        builder.Property(m => m.BusinessName).IsRequired().HasMaxLength(200);
        builder.Property(m => m.Slug).IsRequired().HasMaxLength(100);
        builder.HasIndex(m => m.Slug).IsUnique();
    }
}
