namespace Dukaan.Application.Tests.Auth;

using Xunit;
using Moq;
using Dukaan.Application.Features.Customers.Commands.RegisterCustomer;

public class RegisterHandlerTests
{
    [Fact]
    public async Task Handle_NewEmail_ReturnsSuccess()
    {
        var repo = new Mock<IRepository<Customer>>();
        repo.Setup(x => x.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync((Customer?)null);

        var handler = new RegisterCustomerHandler(repo.Object, null!);
        var command = new RegisterCustomerCommand
        {
            Email = "new@example.com",
            FullName = "New User",
            Password = "SecurePass123!"
        };

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.False(result.IsError);
    }

    [Fact]
    public async Task Handle_DuplicateEmail_ReturnsError()
    {
        var repo = new Mock<IRepository<Customer>>();
        repo.Setup(x => x.GetByEmailAsync(It.IsAny<string>()))
            .ReturnsAsync(new Customer { Email = "exists@example.com" });

        var handler = new RegisterCustomerHandler(repo.Object, null!);
        var command = new RegisterCustomerCommand
        {
            Email = "exists@example.com",
            FullName = "User",
            Password = "Pass123!"
        };

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.IsError);
    }
}
