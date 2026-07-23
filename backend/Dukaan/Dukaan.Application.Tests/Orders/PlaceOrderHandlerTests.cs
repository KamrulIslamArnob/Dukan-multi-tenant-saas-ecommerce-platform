namespace Dukaan.Application.Tests.Orders;

using Xunit;
using Moq;
using Dukaan.Application.Features.Orders.Commands.PlaceOrder;

public class PlaceOrderHandlerTests
{
    [Fact]
    public async Task Handle_ValidOrder_ReturnsOrderNumber()
    {
        var orderRepo = new Mock<IRepository<Order>>();
        var cartRepo = new Mock<IRepository<Cart>>();
        cartRepo.Setup(x => x.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Cart
            {
                Items = new List<CartItem>
                    { new CartItem { ProductId = Guid.NewGuid(), Quantity = 2, UnitPrice = 15.00m } }
            });

        var handler = new PlaceOrderHandler(orderRepo.Object, cartRepo.Object, null!, null!);
        var command = new PlaceOrderCommand { CustomerId = Guid.NewGuid(), CartId = Guid.NewGuid() };

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.False(result.IsError);
        Assert.NotEmpty(result.Value.OrderNumber);
    }
}
