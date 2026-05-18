using Coursework.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Coursework.Application.Interfaces;

public interface IUserRepository
{
    IQueryable<ApplicationUser> FindAll(bool trackChanges = false);

    Task<ApplicationUser?> FindByIdAsync(string userId);

    Task<ApplicationUser?> FindByEmailAsync(string email);

    Task<IdentityResult> CreateAsync(ApplicationUser user, string password);

    Task<IdentityResult> UpdateAsync(ApplicationUser user);

    Task<bool> CheckPasswordAsync(ApplicationUser user, string password);

    Task<IList<string>> GetRolesAsync(ApplicationUser user);

    Task<IdentityResult> AddToRoleAsync(ApplicationUser user, string role);

    Task EnsureRoleExistsAsync(string roleName);

    Task<List<ApplicationUser>> GetUsersByIdsAsync(IEnumerable<string> userIds);
}
