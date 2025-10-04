using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using System;
using Xunit;

namespace BingGoWebAPI.Tests.Integration
{
    public class IntegrationTestFixture : IDisposable
    {
        public WebApplicationFactory<Program> Factory { get; private set; }

        public IntegrationTestFixture()
        {
            Factory = new WebApplicationFactory<Program>()
                .WithWebHostBuilder(builder =>
                {
                    builder.UseEnvironment("Testing");

                    builder.ConfigureAppConfiguration((context, config) =>
                    {
                        config.AddJsonFile("appsettings.Testing.json", optional: false);
                        config.AddEnvironmentVariables();
                    });

                    builder.ConfigureServices(services =>
                    {
                        // Add any test-specific service overrides here
                        // For example, you might want to use in-memory databases
                        // or mock external services
                    });
                });
        }

        public void Dispose()
        {
            Factory?.Dispose();
        }
    }
}