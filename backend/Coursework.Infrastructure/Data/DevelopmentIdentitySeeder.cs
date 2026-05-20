using Coursework.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Coursework.Infrastructure.Data;

public static class DevelopmentIdentitySeeder
{
    private const string AdminRoleName = "Admin";
    private const string StaffRoleName = "Staff";

    private const string AdminUserId = "dev-admin-user";
    private const string StaffUserId = "dev-staff-user";

    private const string AdminEmail = "admin@autocareims.com";
    private const string StaffEmail = "staff@gmail.com";

    private const string AdminPassword = "admin123";
    private const string StaffPassword = "staff123";

    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();

        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>()
            .CreateLogger("DevelopmentIdentitySeeder");

        await EnsureRoleExistsAsync(roleManager, AdminRoleName);
        await EnsureRoleExistsAsync(roleManager, StaffRoleName);

        await EnsureUserAsync(
            userManager,
            logger,
            userId: AdminUserId,
            fullName: "Development Admin",
            email: AdminEmail,
            password: AdminPassword,
            roleName: AdminRoleName);

        await EnsureUserAsync(
            userManager,
            logger,
            userId: StaffUserId,
            fullName: "Staff User",
            email: StaffEmail,
            password: StaffPassword,
            roleName: StaffRoleName);
    }

    private static async Task EnsureRoleExistsAsync(RoleManager<IdentityRole> roleManager, string roleName)
    {
        if (!await roleManager.RoleExistsAsync(roleName))
        {
            await roleManager.CreateAsync(new IdentityRole(roleName));
        }
    }

    private static async Task EnsureUserAsync(
        UserManager<ApplicationUser> userManager,
        ILogger logger,
        string userId,
        string fullName,
        string email,
        string password,
        string roleName)
    {
        var user = await userManager.FindByIdAsync(userId)
            ?? await userManager.FindByEmailAsync(email);

        if (user == null)
        {
            user = new ApplicationUser
            {
                Id = userId,
                FullName = fullName,
                UserName = email,
                Email = email,
                EmailConfirmed = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
            };

            var createResult = await userManager.CreateAsync(user, password);

            if (!createResult.Succeeded)
            {
                logger.LogWarning(
                    "Unable to create development user {Email}: {Errors}",
                    email,
                    string.Join(", ", createResult.Errors.Select(error => error.Description)));

                return;
            }
        }
        else
        {
            var requiresUpdate = false;

            if (user.Id != userId)
            {
                user.Id = userId;
                requiresUpdate = true;
            }

            if (!string.Equals(user.FullName, fullName, StringComparison.Ordinal))
            {
                user.FullName = fullName;
                requiresUpdate = true;
            }

            if (!string.Equals(user.UserName, email, StringComparison.OrdinalIgnoreCase))
            {
                user.UserName = email;
                requiresUpdate = true;
            }

            if (!string.Equals(user.Email, email, StringComparison.OrdinalIgnoreCase))
            {
                user.Email = email;
                requiresUpdate = true;
            }

            if (!user.EmailConfirmed)
            {
                user.EmailConfirmed = true;
                requiresUpdate = true;
            }

            if (!user.IsActive)
            {
                user.IsActive = true;
                requiresUpdate = true;
            }

            if (requiresUpdate)
            {
                var updateResult = await userManager.UpdateAsync(user);

                if (!updateResult.Succeeded)
                {
                    logger.LogWarning(
                        "Unable to update development user {Email}: {Errors}",
                        email,
                        string.Join(", ", updateResult.Errors.Select(error => error.Description)));
                }
            }

            var passwordValid = await userManager.CheckPasswordAsync(user, password);

            if (!passwordValid)
            {
                var resetToken = await userManager.GeneratePasswordResetTokenAsync(user);
                var resetResult = await userManager.ResetPasswordAsync(user, resetToken, password);

                if (!resetResult.Succeeded)
                {
                    logger.LogWarning(
                        "Unable to reset password for development user {Email}: {Errors}",
                        email,
                        string.Join(", ", resetResult.Errors.Select(error => error.Description)));
                }
            }
        }

        if (!await userManager.IsInRoleAsync(user, roleName))
        {
            var addToRoleResult = await userManager.AddToRoleAsync(user, roleName);

            if (!addToRoleResult.Succeeded)
            {
                logger.LogWarning(
                    "Unable to assign role {RoleName} to development user {Email}: {Errors}",
                    roleName,
                    email,
                    string.Join(", ", addToRoleResult.Errors.Select(error => error.Description)));
            }
        }
    }
}
