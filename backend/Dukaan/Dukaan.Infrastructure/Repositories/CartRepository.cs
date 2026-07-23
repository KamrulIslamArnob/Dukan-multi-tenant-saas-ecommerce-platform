namespace Dukaan.Infrastructure.Repositories;

using Dukaan.Application.Interfaces;
using Dukaan.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class CartRepository : IRepository<Cart>
{
    private readonly ApplicationDbContext _context;

    public CartRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Cart?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.Carts.Include(c => c.Items).FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task<IReadOnlyList<Cart>> GetAllAsync(CancellationToken ct = default)
        => await _context.Carts.ToListAsync(ct);

    public async Task AddAsync(Cart entity, CancellationToken ct = default)
        => await _context.Carts.AddAsync(entity, ct);

    public void Update(Cart entity) => _context.Carts.Update(entity);

    public void Delete(Cart entity) => _context.Carts.Remove(entity);

    public async Task<Cart?> GetByCustomerAsync(Guid customerId, CancellationToken ct = default)
        => await _context.Carts.Include(c => c.Items).FirstOrDefaultAsync(c => c.CustomerId == customerId, ct);
}
