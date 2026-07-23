namespace Dukaan.Application.Tests.Products;

using Xunit;
using Moq;
using Dukaan.Application.Features.Products.Commands.CreateProduct;

public class CreateProductHandlerTests
{
    [Fact]
    public async Task Handle_ValidProduct_ReturnsProductId()
    {
        var repo = new Mock<IRepository<Product>>();
        var handler = new CreateProductHandler(repo.Object);
        var command = new CreateProductCommand
        {
            Name = "Test Product",
            Price = 29.99m,
            StockQuantity = 100,
            Description = "A test product"
        };

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.False(result.IsError);
        repo.Verify(x => x.AddAsync(It.IsAny<Product>(), It.IsAny<CancellationToken>()), Times.Once);
    }
}
