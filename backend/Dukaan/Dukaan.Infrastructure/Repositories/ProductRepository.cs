namespace Dukaan.Infrastructure.Repositories;

using Dukaan.Application.Interfaces;
using Dukaan.Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class ProductRepository : IRepository<Product>
{
    private readonly ApplicationDbContext _context;

    public ProductRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Product?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.Products.Include(p => p.Categories).FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<IReadOnlyList<Product>> GetAllAsync(CancellationToken ct = default)
        => await _context.Products.Where(p => !p.IsDeleted).ToListAsync(ct);

    public async Task AddAsync(Product entity, CancellationToken ct = default)
        => await _context.Products.AddAsync(entity, ct);

    public void Update(Product entity) => _context.Products.Update(entity);

    public void Delete(Product entity) => _context.Products.Remove(entity);

    public async Task<IReadOnlyList<Product>> GetByCategoryAsync(Guid categoryId, CancellationToken ct = default)
        => await _context.Products.Where(p => p.Categories.Any(c => c.CategoryId == categoryId) && !p.IsDeleted).ToListAsync(ct);
}
