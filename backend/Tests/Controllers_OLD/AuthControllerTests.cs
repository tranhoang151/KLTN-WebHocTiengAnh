using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using FluentAssertions;
using BingGoWebAPI.Controllers;
using BingGoWebAPI.Models;
using BingGoWebAPI.Services;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace BingGoWebAPI.Tests.Controllers
{
    public class AuthControllerTests
    {
        private readonly Mock<IFirebaseService> _mockFirebaseService;
        private readonly Mock<ILogger<AuthController>> _mockLogger;
        private readonly AuthController _controller;

        public AuthControllerTests()
        {
            _mockFirebaseService = new Mock<IFirebaseService>();
            _mockLogger = new Mock<ILogger<AuthController>>();
            _controller = new AuthController(_mockFirebaseService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task Login_ValidCredentials_ReturnsOkResult()
        {
            // Arrange
            var loginRequest = new LoginRequest
            {
                Email = "test@example.com",
                Password = "password123"
            };

            var expectedUser = new User
            {
                Id = "test-uid",
                Email = "test@example.com",
                DisplayName = "Test User",
                Role = "student"
            };

            _mockFirebaseService
                .Setup(x => x.AuthenticateUserAsync(loginRequest.Email, loginRequest.Password))
                .ReturnsAsync(expectedUser);

            // Act
            var result = await _controller.Login(loginRequest);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<LoginResponse>(okResult.Value);
            Assert.Equal(expectedUser.Email, response.User.Email);
            Assert.Equal(expectedUser.Role, response.User.Role);
            Assert.NotNull(response.Token);
        }

        [Fact]
        public async Task Login_InvalidCredentials_ReturnsUnauthorized()
        {
            // Arrange
            var loginRequest = new LoginRequest
            {
                Email = "invalid@example.com",
                Password = "wrongpassword"
            };

            _mockFirebaseService
                .Setup(x => x.AuthenticateUserAsync(loginRequest.Email, loginRequest.Password))
                .ThrowsAsync(new UnauthorizedAccessException("Invalid credentials"));

            // Act
            var result = await _controller.Login(loginRequest);

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            var response = Assert.IsType<ApiResponse>(unauthorizedResult.Value);
            Assert.False(response.Success);
            Assert.Contains("Invalid credentials", response.Error);
        }

        [Fact]
        public async Task Login_MissingEmail_ReturnsBadRequest()
        {
            // Arrange
            var loginRequest = new LoginRequest
            {
                Email = "",
                Password = "password123"
            };

            // Act
            var result = await _controller.Login(loginRequest);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var response = Assert.IsType<ApiResponse>(badRequestResult.Value);
            Assert.False(response.Success);
            Assert.Contains("Email is required", response.Error);
        }

        [Fact]
        public async Task Login_MissingPassword_ReturnsBadRequest()
        {
            // Arrange
            var loginRequest = new LoginRequest
            {
                Email = "test@example.com",
                Password = ""
            };

            // Act
            var result = await _controller.Login(loginRequest);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var response = Assert.IsType<ApiResponse>(badRequestResult.Value);
            Assert.False(response.Success);
            Assert.Contains("Password is required", response.Error);
        }

        [Fact]
        public async Task Register_ValidData_ReturnsCreatedResult()
        {
            // Arrange
            var registerRequest = new RegisterRequest
            {
                Email = "newuser@example.com",
                Password = "password123",
                DisplayName = "New User",
                Role = "student"
            };

            var expectedUser = new User
            {
                Id = "new-user-uid",
                Email = registerRequest.Email,
                DisplayName = registerRequest.DisplayName,
                Role = registerRequest.Role
            };

            _mockFirebaseService
                .Setup(x => x.CreateUserAsync(registerRequest.Email, registerRequest.Password, It.IsAny<User>()))
                .ReturnsAsync(expectedUser);

            // Act
            var result = await _controller.Register(registerRequest);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            var response = Assert.IsType<RegisterResponse>(createdResult.Value);
            Assert.Equal(expectedUser.Email, response.User.Email);
            Assert.Equal(expectedUser.Role, response.User.Role);
        }

        [Fact]
        public async Task Register_DuplicateEmail_ReturnsConflict()
        {
            // Arrange
            var registerRequest = new RegisterRequest
            {
                Email = "existing@example.com",
                Password = "password123",
                DisplayName = "Existing User",
                Role = "student"
            };

            _mockFirebaseService
                .Setup(x => x.CreateUserAsync(registerRequest.Email, registerRequest.Password, It.IsAny<User>()))
                .ThrowsAsync(new InvalidOperationException("Email already exists"));

            // Act
            var result = await _controller.Register(registerRequest);

            // Assert
            var conflictResult = Assert.IsType<ConflictObjectResult>(result);
            var response = Assert.IsType<ApiResponse>(conflictResult.Value);
            Assert.False(response.Success);
            Assert.Contains("Email already exists", response.Error);
        }

        [Fact]
        public async Task GetCurrentUser_AuthenticatedUser_ReturnsUserInfo()
        {
            // Arrange
            var userId = "test-uid";
            var expectedUser = new User
            {
                Id = userId,
                Email = "test@example.com",
                DisplayName = "Test User",
                Role = "student"
            };

            // Mock authenticated user
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId),
                new Claim(ClaimTypes.Email, expectedUser.Email)
            };
            var identity = new ClaimsIdentity(claims, "Test");
            var principal = new ClaimsPrincipal(identity);

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = principal
                }
            };

            _mockFirebaseService
                .Setup(x => x.GetUserByIdAsync(userId))
                .ReturnsAsync(expectedUser);

            // Act
            var result = await _controller.GetCurrentUser();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<UserResponse>(okResult.Value);
            Assert.Equal(expectedUser.Email, response.User.Email);
            Assert.Equal(expectedUser.Role, response.User.Role);
        }

        [Fact]
        public async Task GetCurrentUser_UnauthenticatedUser_ReturnsUnauthorized()
        {
            // Arrange
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };

            // Act
            var result = await _controller.GetCurrentUser();

            // Assert
            Assert.IsType<UnauthorizedResult>(result);
        }

        [Fact]
        public async Task Logout_AuthenticatedUser_ReturnsOk()
        {
            // Arrange
            var userId = "test-uid";
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, userId)
            };
            var identity = new ClaimsIdentity(claims, "Test");
            var principal = new ClaimsPrincipal(identity);

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = principal
                }
            };

            _mockFirebaseService
                .Setup(x => x.RevokeUserTokensAsync(userId))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.Logout();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal("Logged out successfully", response.Message);
        }

        [Fact]
        public async Task RefreshToken_ValidToken_ReturnsNewToken()
        {
            // Arrange
            var refreshRequest = new RefreshTokenRequest
            {
                RefreshToken = "valid-refresh-token"
            };

            var newToken = "new-access-token";

            _mockFirebaseService
                .Setup(x => x.RefreshTokenAsync(refreshRequest.RefreshToken))
                .ReturnsAsync(newToken);

            // Act
            var result = await _controller.RefreshToken(refreshRequest);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<RefreshTokenResponse>(okResult.Value);
            Assert.Equal(newToken, response.Token);
        }

        [Fact]
        public async Task RefreshToken_InvalidToken_ReturnsUnauthorized()
        {
            // Arrange
            var refreshRequest = new RefreshTokenRequest
            {
                RefreshToken = "invalid-refresh-token"
            };

            _mockFirebaseService
                .Setup(x => x.RefreshTokenAsync(refreshRequest.RefreshToken))
                .ThrowsAsync(new UnauthorizedAccessException("Invalid refresh token"));

            // Act
            var result = await _controller.RefreshToken(refreshRequest);

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            var response = Assert.IsType<ApiResponse>(unauthorizedResult.Value);
            Assert.False(response.Success);
            Assert.Contains("Invalid refresh token", response.Error);
        }

        [Fact]
        public async Task ResetPassword_ValidEmail_ReturnsOk()
        {
            // Arrange
            var resetRequest = new ResetPasswordRequest
            {
                Email = "user@example.com"
            };

            _mockFirebaseService
                .Setup(x => x.SendPasswordResetEmailAsync(resetRequest.Email))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _controller.ResetPassword(resetRequest);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponse>(okResult.Value);
            Assert.True(response.Success);
            Assert.Contains("Password reset email sent", response.Message);
        }

        [Fact]
        public async Task ResetPassword_InvalidEmail_ReturnsBadRequest()
        {
            // Arrange
            var resetRequest = new ResetPasswordRequest
            {
                Email = "invalid-email"
            };

            // Act
            var result = await _controller.ResetPassword(resetRequest);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var response = Assert.IsType<ApiResponse>(badRequestResult.Value);
            Assert.False(response.Success);
            Assert.Contains("Invalid email format", response.Error);
        }
    }
}