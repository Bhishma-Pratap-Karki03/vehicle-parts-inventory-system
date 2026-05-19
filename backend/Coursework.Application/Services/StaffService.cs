using Coursework.Application.DTOs.Staff;
using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Coursework.Application.Services;

public class StaffService : IStaffService
{
    private const string StaffRole = "Staff";

    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public StaffService(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task<object> CreateStaffAsync(CreateStaffDto dto)
    {
        var email = dto.Email.Trim();

        if (!await _roleManager.RoleExistsAsync(StaffRole))
        {
            throw new InvalidOperationException("Invalid role.");
        }

        var existingUser = await _userManager.FindByEmailAsync(email);

        if (existingUser != null)
        {
            throw new InvalidOperationException("Email already exists.");
        }

        var user = new ApplicationUser
        {
            FullName = dto.FullName.Trim(),
            Email = email,
            UserName = email,
            PhoneNumber = dto.PhoneNumber?.Trim(),
            Address = dto.Address?.Trim(),
            EmailConfirmed = true
        };

        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException(errors);
        }

        var roleResult = await _userManager.AddToRoleAsync(user, StaffRole);

        if (!roleResult.Succeeded)
        {
            await _userManager.DeleteAsync(user);

            var errors = string.Join(", ", roleResult.Errors.Select(e => e.Description));
            throw new InvalidOperationException(errors);
        }

        return new
        {
            user.Id,
            user.FullName,
            user.Email,
            user.PhoneNumber,
            user.Address,
            user.IsActive,
            Roles = new[] { StaffRole }
        };
    }

    public async Task<List<object>> GetAllStaffAsync()
    {
        var users = _userManager.Users.ToList();

        var staffList = new List<object>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);

            if (roles.Contains(StaffRole))
            {
                staffList.Add(new
                {
                    user.Id,
                    user.FullName,
                    user.Email,
                    user.PhoneNumber,
                    user.Address,
                    user.IsActive,
                    Roles = roles
                });
            }
        }

        return staffList;
    }

    public async Task<bool> UpdateStaffAsync(string userId, UpdateStaffDto dto)
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
        {
            throw new KeyNotFoundException("Staff not found.");
        }

        var email = dto.Email.Trim();
        var existingUser = await _userManager.FindByEmailAsync(email);

        if (existingUser != null && existingUser.Id != user.Id)
        {
            throw new InvalidOperationException("Email already exists.");
        }

        user.FullName = dto.FullName.Trim();
        user.Email = email;
        user.UserName = email;
        user.PhoneNumber = dto.PhoneNumber?.Trim();
        user.Address = dto.Address?.Trim();
        user.UpdatedAt = DateTime.UtcNow;

        var updateResult = await _userManager.UpdateAsync(user);

        if (!updateResult.Succeeded)
        {
            var errors = string.Join(", ", updateResult.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to update staff. {errors}");
        }

        if (!string.IsNullOrWhiteSpace(dto.Password))
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var passwordResult = await _userManager.ResetPasswordAsync(user, token, dto.Password);

            if (!passwordResult.Succeeded)
            {
                var errors = string.Join(", ", passwordResult.Errors.Select(e => e.Description));
                throw new InvalidOperationException(
                    $"Staff details were updated, but password update failed. {errors}");
            }
        }

        return true;
    }

    public async Task<bool> UpdateRoleAsync(string userId, string role)
    {
        role = role.Trim();

        if (!await _roleManager.RoleExistsAsync(role))
        {
            throw new InvalidOperationException("Invalid role.");
        }

        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
        {
            throw new InvalidOperationException("User not found.");
        }

        var roles = await _userManager.GetRolesAsync(user);

        if (roles.Any())
        {
            var removeResult = await _userManager.RemoveFromRolesAsync(user, roles);

            if (!removeResult.Succeeded)
            {
                var errors = string.Join(", ", removeResult.Errors.Select(e => e.Description));
                throw new InvalidOperationException(errors);
            }
        }

        var addResult = await _userManager.AddToRoleAsync(user, role);

        if (!addResult.Succeeded)
        {
            var errors = string.Join(", ", addResult.Errors.Select(e => e.Description));
            throw new InvalidOperationException(errors);
        }

        return true;
    }

    public async Task<bool> DeleteStaffAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
        {
            throw new KeyNotFoundException("Staff not found.");
        }

        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;

        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to delete staff. {errors}");
        }

        return true;
    }
}
