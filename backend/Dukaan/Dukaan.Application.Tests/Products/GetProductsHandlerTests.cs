namespace Dukaan.Application.Tests.Products;

using Xunit;
using Moq;
using Dukaan.Application.Features.Products.Queries.GetProducts;

public class GetProductsHandlerTests
{
    [Fact]
    public async Task Handle_ReturnsProductList()
    {
        var products = new List<Product>
        {
            new Product { Id = Guid.NewGuid(), Name = "Product 1", Price = 10.00m },
            new Product { Id = Guid.NewGuid(), Name = "Product 2", Price = 20.00m }
        };

        var repo = new Mock<IRepository<Product>>();
        repo.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync(products);

        var handler = new GetProductsHandler(repo.Object);
        var query = new GetProductsQuery { Page = 1, PageSize = 10 };

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Equal(2, result.Items.Count);
    }
}
