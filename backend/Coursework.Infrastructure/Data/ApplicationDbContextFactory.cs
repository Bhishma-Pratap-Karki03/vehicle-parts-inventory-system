using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Coursework.Infrastructure.Data;

public sealed class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseNpgsql(GetConnectionString());

        return new ApplicationDbContext(optionsBuilder.Options);
    }

    private static string GetConnectionString()
    {
        var environmentConnectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");
        if (!string.IsNullOrWhiteSpace(environmentConnectionString))
        {
            return environmentConnectionString;
        }

        foreach (var basePath in GetCandidateBasePaths())
        {
            var connectionString = ReadConnectionStringFromSettings(basePath, "appsettings.json");
            if (!string.IsNullOrWhiteSpace(connectionString))
            {
                return connectionString;
            }

            var environmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
            if (!string.IsNullOrWhiteSpace(environmentName))
            {
                connectionString = ReadConnectionStringFromSettings(basePath, $"appsettings.{environmentName}.json");
                if (!string.IsNullOrWhiteSpace(connectionString))
                {
                    return connectionString;
                }
            }
        }

        return "Host=localhost;Port=5432;Database=vehicleIMS;Username=postgres;Password=Bhishma@990";
    }

    private static IEnumerable<string> GetCandidateBasePaths()
    {
        yield return AppContext.BaseDirectory;
        yield return Directory.GetCurrentDirectory();
        yield return Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "Coursework"));
        yield return Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "backend", "Coursework"));
    }

    private static string? ReadConnectionStringFromSettings(string basePath, string fileName)
    {
        var filePath = Path.Combine(basePath, fileName);
        if (!File.Exists(filePath))
        {
            return null;
        }

        using var stream = File.OpenRead(filePath);
        using var document = JsonDocument.Parse(stream);

        if (!document.RootElement.TryGetProperty("ConnectionStrings", out var connectionStrings))
        {
            return null;
        }

        return connectionStrings.TryGetProperty("DefaultConnection", out var defaultConnection)
            ? defaultConnection.GetString()
            : null;
    }
}
