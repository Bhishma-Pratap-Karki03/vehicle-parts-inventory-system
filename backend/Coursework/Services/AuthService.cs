using Coursework.Application.Common;
using Coursework.Application.DTOs.Auth;
using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace Coursework.Services;

public class AuthService : IAuthService
{
    private const string CustomerRoleName = "Customer";

    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IJwtTokenService jwtTokenService,
        ILogger<AuthService> logger)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _jwtTokenService = jwtTokenService;
        _logger = logger;
    }

    public async Task<ApiResponse<AuthResponseDto>> RegisterCustomerAsync(RegisterCustomerDto dto)
    {
        try
        {
            var existingUser = await _userManager.FindByEmailAsync(dto.Email);

            if (existingUser != null)
            {
                return ApiResponse<AuthResponseDto>.ConflictResponse(
                    "An account with this email already exists.");
            }

            if (!await _roleManager.RoleExistsAsync(CustomerRoleName))
            {
                await _roleManager.CreateAsync(new IdentityRole(CustomerRoleName));
            }

            var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                FullName = dto.FullName.Trim(),
                PhoneNumber = string.IsNullOrWhiteSpace(dto.PhoneNumber)
                    ? null
                    : dto.PhoneNumber.Trim(),
                Address = string.IsNullOrWhiteSpace(dto.Address)
                    ? null
                    : dto.Address.Trim(),
                EmailConfirmed = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var createResult = await _userManager.CreateAsync(user, dto.Password);

            if (!createResult.Succeeded)
            {
                var errors = createResult.Errors.Select(error => error.Description).ToList();

                return ApiResponse<AuthResponseDto>.FailureResponse(
                    "Unable to create the account.",
                    errors: errors);
            }

            var roleResult = await _userManager.AddToRoleAsync(user, CustomerRoleName);

            if (!roleResult.Succeeded)
            {
                _logger.LogWarning(
                    "Failed to assign Customer role to user {UserId}: {Errors}",
                    user.Id,
                    string.Join(", ", roleResult.Errors.Select(e => e.Description)));
            }

            var response = await BuildAuthResponseAsync(user);

            return ApiResponse<AuthResponseDto>.CreatedResponse(
                response,
                "Account created successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while registering customer with email {Email}.", dto.Email);

            return ApiResponse<AuthResponseDto>.ServerErrorResponse(
                "An error occurred while creating the account.");
        }
    }

    public async Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginDto dto)
    {
        try
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);

            if (user == null || !user.IsActive)
            {
                return ApiResponse<AuthResponseDto>.UnauthorizedResponse(
                    "Invalid email or password.");
            }

            var passwordValid = await _userManager.CheckPasswordAsync(user, dto.Password);

            if (!passwordValid)
            {
                return ApiResponse<AuthResponseDto>.UnauthorizedResponse(
                    "Invalid email or password.");
            }

            var response = await BuildAuthResponseAsync(user);

            return ApiResponse<AuthResponseDto>.SuccessResponse(
                response,
                "Logged in successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while logging in user with email {Email}.", dto.Email);

            return ApiResponse<AuthResponseDto>.ServerErrorResponse(
                "An error occurred while logging in.");
        }
    }

    public async Task<ApiResponse<AuthenticatedUserDto>> GetCurrentUserAsync(string userId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                return ApiResponse<AuthenticatedUserDto>.UnauthorizedResponse(
                    "User identifier was not provided.");
            }

            var user = await _userManager.FindByIdAsync(userId);

            if (user == null || !user.IsActive)
            {
                return ApiResponse<AuthenticatedUserDto>.NotFoundResponse(
                    "User was not found.");
            }

            var roles = await _userManager.GetRolesAsync(user);

            var dto = new AuthenticatedUserDto
            {
                UserId = user.Id,
                FullName = user.FullName,
                Email = user.Email ?? string.Empty,
                PhoneNumber = user.PhoneNumber,
                Address = user.Address,
                Roles = roles.ToList()
            };

            return ApiResponse<AuthenticatedUserDto>.SuccessResponse(
                dto,
                "User retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while loading current user {UserId}.", userId);

            return ApiResponse<AuthenticatedUserDto>.ServerErrorResponse(
                "An error occurred while loading user details.");
        }
    }

    private async Task<AuthResponseDto> BuildAuthResponseAsync(ApplicationUser user)
    {
        var token = await _jwtTokenService.GenerateTokenAsync(user);
        var expiry = _jwtTokenService.GetTokenExpiry();
        var roles = await _userManager.GetRolesAsync(user);

        return new AuthResponseDto
        {
            Token = token,
            ExpiresAt = expiry,
            User = new AuthenticatedUserDto
            {
                UserId = user.Id,
                FullName = user.FullName,
                Email = user.Email ?? string.Empty,
                PhoneNumber = user.PhoneNumber,
                Address = user.Address,
                Roles = roles.ToList()
            }
        };
    }
}
