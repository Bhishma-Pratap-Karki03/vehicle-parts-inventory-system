using Coursework.Application.Common;
using Coursework.Application.DTOs.Auth;
using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Coursework.Application.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;

    public AuthService(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<ApiResponse<LoginResponseDto>> LoginAsync(LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);

        if (user == null)
        {
            return ApiResponse<LoginResponseDto>.UnauthorizedResponse(
                "Invalid email or password.");
        }

        var isPasswordValid =
            await _userManager.CheckPasswordAsync(user, dto.Password);

        if (!isPasswordValid)
        {
            return ApiResponse<LoginResponseDto>.UnauthorizedResponse(
                "Invalid email or password.");
        }

        var roles = await _userManager.GetRolesAsync(user);

        var response = new LoginResponseDto
        {
            FullName = user.FullName,
            Email = user.Email!,
            Role = roles.FirstOrDefault() ?? "Staff",
            Token = "login-success"
        };

        return ApiResponse<LoginResponseDto>.SuccessResponse(
            response,
            "Login successful.");
    }
}