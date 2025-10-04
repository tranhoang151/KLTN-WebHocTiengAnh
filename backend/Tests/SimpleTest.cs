using Xunit;
using FluentAssertions;

namespace BingGoWebAPI.Tests
{
    public class SimpleTest
    {
        [Fact]
        public void SimpleTest_ShouldPass()
        {
            // Arrange
            var expected = 2;

            // Act
            var actual = 1 + 1;

            // Assert
            actual.Should().Be(expected);
        }

        [Fact]
        public void StringTest_ShouldPass()
        {
            // Arrange
            var expected = "Hello World";

            // Act
            var actual = "Hello" + " " + "World";

            // Assert
            actual.Should().Be(expected);
        }
    }
}