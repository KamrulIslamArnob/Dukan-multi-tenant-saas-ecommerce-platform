namespace Dukaan.Application.Tests.Auth;

using Xunit;
using Moq;
using Dukaan.Application.Features.Auth.Commands.Login;

public class LoginHandlerTests
{
    [Fact]
    public async Task Handle_ValidCredentials_ReturnsToken()
    {
        // Arrange
        var userService = new Mock<IUserService>();
        userService.Setup(x => x.ValidateCredentialsAsync(It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync(new UserValidationResult { Succeeded = true, UserId = Guid.NewGuid() });

        var handler = new LoginHandler(userService.Object, null!);
        var command = new LoginCommand { Email = "test@example.com", Password = "password123" };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.NotEmpty(result.Token);
    }

    [Fact]
    public async Task Handle_InvalidCredentials_ReturnsError()
    {
        var userService = new Mock<IUserService>();
        userService.Setup(x => x.ValidateCredentialsAsync(It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync(new UserValidationResult { Succeeded = false });

        var handler = new LoginHandler(userService.Object, null!);
        var command = new LoginCommand { Email = "test@example.com", Password = "wrong" };

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result.IsError);
    }
}
