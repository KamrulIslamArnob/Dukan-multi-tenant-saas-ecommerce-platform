namespace Dukaan.Infrastructure.Repositories;

using Dukaan.Application.Interfaces;
using Dukaan.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class OrderRepository : IRepository<Order>
{
    private readonly ApplicationDbContext _context;

    public OrderRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Order?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == id, ct);

    public async Task<IReadOnlyList<Order>> GetAllAsync(CancellationToken ct = default)
        => await _context.Orders.ToListAsync(ct);

    public async Task AddAsync(Order entity, CancellationToken ct = default)
        => await _context.Orders.AddAsync(entity, ct);

    public void Update(Order entity) => _context.Orders.Update(entity);

    public void Delete(Order entity) => _context.Orders.Remove(entity);

    public async Task<IReadOnlyList<Order>> GetByCustomerAsync(Guid customerId, CancellationToken ct = default)
        => await _context.Orders.Where(o => o.CustomerId == customerId).OrderByDescending(o => o.CreatedAt).ToListAsync(ct);
}
