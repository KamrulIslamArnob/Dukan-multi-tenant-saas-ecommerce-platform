namespace Dukaan.Infrastructure.Data.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Dukaan.Domain.Entities;

public class CartConfiguration : IEntityTypeConfiguration<Cart>
{
    public void Configure(EntityTypeBuilder<Cart> builder)
    {
        builder.HasKey(c => c.Id);
        builder.HasMany(c => c.Items).WithOne().HasForeignKey(i => i.CartId);
        builder.HasOne(c => c.Customer).WithMany().HasForeignKey(c => c.CustomerId);
    }
}
