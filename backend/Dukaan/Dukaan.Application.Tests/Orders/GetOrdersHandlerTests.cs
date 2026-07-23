namespace Dukaan.Application.Tests.Orders;

using Xunit;
using Moq;
using Dukaan.Application.Features.Orders.Queries.GetOrders;

public class GetOrdersHandlerTests
{
    [Fact]
    public async Task Handle_ReturnsOrdersForCustomer()
    {
        var orders = new List<Order>
        {
            new Order { Id = Guid.NewGuid(), OrderNumber = "ORD-001", CustomerId = Guid.NewGuid() },
            new Order { Id = Guid.NewGuid(), OrderNumber = "ORD-002", CustomerId = Guid.NewGuid() }
        };

        var repo = new Mock<IRepository<Order>>();
        repo.Setup(x => x.GetByCustomerAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(orders);

        var handler = new GetOrdersHandler(repo.Object);
        var query = new GetOrdersQuery { CustomerId = Guid.NewGuid() };

        var result = await handler.Handle(query, CancellationToken.None);

        Assert.Equal(2, result.Items.Count);
    }
}
