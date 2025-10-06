
using Xunit;
using BingGoWebAPI.Services;

namespace BingGoWebAPI.Tests.Services
{
    public class PasswordHashingServiceTests
    {
        private readonly IPasswordHashingService _passwordHashingService = new PasswordHashingService();

        [Fact]
        public void HashPassword_ShouldReturnNonEmptyString()
        {
            // Arrange
            var password = "mysecretpassword";

            // Act
            var hashedPassword = _passwordHashingService.HashPassword(password);

            // Assert
            Assert.NotNull(hashedPassword);
            Assert.NotEmpty(hashedPassword);
        }

        [Fact]
        public void HashPassword_ShouldNotReturnOriginalPassword()
        {
            // Arrange
            var password = "mysecretpassword";

            // Act
            var hashedPassword = _passwordHashingService.HashPassword(password);

            // Assert
            Assert.NotEqual(password, hashedPassword);
        }

        [Fact]
        public void VerifyPassword_ShouldReturnTrue_ForCorrectPassword()
        {
            // Arrange
            var password = "mysecretpassword";
            var hashedPassword = _passwordHashingService.HashPassword(password);

            // Act
            var result = _passwordHashingService.VerifyPassword(password, hashedPassword);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public void VerifyPassword_ShouldReturnFalse_ForIncorrectPassword()
        {
            // Arrange
            var password = "mysecretpassword";
            var wrongPassword = "wrongpassword";
            var hashedPassword = _passwordHashingService.HashPassword(password);

            // Act
            var result = _passwordHashingService.VerifyPassword(wrongPassword, hashedPassword);

            // Assert
            Assert.False(result);
        }

        [Theory]
        [InlineData("$2a$12$somehashvalue", true)]
        [InlineData("$2b$12$somehashvalue", true)]
        [InlineData("$2y$12$somehashvalue", true)]
        [InlineData("notahashedpassword", false)]
        [InlineData("", false)]
        [InlineData(null, false)]
        public void IsPasswordHashed_ShouldReturnCorrectValue(string password, bool expectedResult)
        {
            // Act
            var result = _passwordHashingService.IsPasswordHashed(password);

            // Assert
            Assert.Equal(expectedResult, result);
        }
    }
}
