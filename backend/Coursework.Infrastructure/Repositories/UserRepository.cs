using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Coursework.Infrastructure.Repositories;

public class UserRepository(
    UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole> roleManager) : IUserRepository
{
    public IQueryable<ApplicationUser> FindAll(bool trackChanges = false) =>
        trackChanges
            ? userManager.Users
            : userManager.Users.AsNoTracking();

    public Task<ApplicationUser?> FindByIdAsync(string userId) =>
        userManager.FindByIdAsync(userId);

    public Task<ApplicationUser?> FindByEmailAsync(string email) =>
        userManager.FindByEmailAsync(email);

    public Task<IdentityResult> CreateAsync(ApplicationUser user, string password) =>
        userManager.CreateAsync(user, password);

    public Task<IdentityResult> UpdateAsync(ApplicationUser user) =>
        userManager.UpdateAsync(user);

    public Task<bool> CheckPasswordAsync(ApplicationUser user, string password) =>
        userManager.CheckPasswordAsync(user, password);

    public Task<IList<string>> GetRolesAsync(ApplicationUser user) =>
        userManager.GetRolesAsync(user);

    public Task<IdentityResult> AddToRoleAsync(ApplicationUser user, string role) =>
        userManager.AddToRoleAsync(user, role);

    public async Task EnsureRoleExistsAsync(string roleName)
    {
        if (!await roleManager.RoleExistsAsync(roleName))
        {
            await roleManager.CreateAsync(new IdentityRole(roleName));
        }
    }

    public async Task<List<ApplicationUser>> GetUsersByIdsAsync(IEnumerable<string> userIds)
    {
        var ids = userIds.ToList();

        if (ids.Count == 0)
        {
            return [];
        }

        return await FindAll()
            .Where(user => ids.Contains(user.Id))
            .ToListAsync();
    }
}
