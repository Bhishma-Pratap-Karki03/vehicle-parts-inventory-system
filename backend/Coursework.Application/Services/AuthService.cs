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

    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository userRepository,
        IJwtTokenService jwtTokenService,
        UserManager<ApplicationUser> userManager,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _jwtTokenService = jwtTokenService;
        _userManager = userManager;
        _logger = logger;
    }

    public async Task<ApiResponse<AuthResponseDto>> RegisterCustomerAsync(RegisterCustomerDto dto)
    {
        try
        {
            var existingUser = await _userRepository.FindByEmailAsync(dto.Email);

            if (existingUser != null)
            {
                return ApiResponse<AuthResponseDto>.ConflictResponse(
                    "An account with this email already exists.");
            }

            await _userRepository.EnsureRoleExistsAsync(CustomerRoleName);

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

            var createResult = await _userRepository.CreateAsync(user, dto.Password);

            if (!createResult.Succeeded)
            {
                var errors = createResult.Errors
                    .Select(error => error.Description)
                    .ToList();

                return ApiResponse<AuthResponseDto>.FailureResponse(
                    "Unable to create the account.",
                    errors: errors);
            }

            var roleResult = await _userRepository.AddToRoleAsync(user, CustomerRoleName);

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
            _logger.LogError(
                ex,
                "Error occurred while registering customer with email {Email}.",
                dto.Email);

            return ApiResponse<AuthResponseDto>.ServerErrorResponse(
                "An error occurred while creating the account.");
        }
    }

    public async Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginDto dto)
    {
        try
        {
            var user = await _userRepository.FindByEmailAsync(dto.Email);

            if (user == null || !user.IsActive)
            {
                return ApiResponse<AuthResponseDto>.UnauthorizedResponse(
                    "Invalid email or password.");
            }

            var passwordValid = await _userRepository.CheckPasswordAsync(user, dto.Password);

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
            _logger.LogError(
                ex,
                "Error occurred while logging in user with email {Email}.",
                dto.Email);

            return ApiResponse<AuthResponseDto>.ServerErrorResponse(
                "An error occurred while logging in.");
        }
    }

    public async Task<ApiResponse<string>> ChangePasswordAsync(ChangePasswordDto dto)
    {
        try
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);

            if (user == null || !user.IsActive)
            {
                return ApiResponse<string>.NotFoundResponse("User not found.");
            }

            var result = await _userManager.ChangePasswordAsync(
                user,
                dto.CurrentPassword,
                dto.NewPassword);

            if (!result.Succeeded)
            {
                var errors = result.Errors
                    .Select(error => error.Description)
                    .ToList();

                return ApiResponse<string>.FailureResponse(
                    "Password change failed.",
                    400,
                    errors);
            }

            return ApiResponse<string>.SuccessResponse(
                "Password updated successfully.",
                "Password changed successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error occurred while changing password for email {Email}.",
                dto.Email);

            return ApiResponse<string>.ServerErrorResponse(
                "An error occurred while changing password.");
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

            var user = await _userRepository.FindByIdAsync(userId);

            if (user == null || !user.IsActive)
            {
                return ApiResponse<AuthenticatedUserDto>.NotFoundResponse(
                    "User was not found.");
            }

            var roles = await _userRepository.GetRolesAsync(user);

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
            _logger.LogError(
                ex,
                "Error occurred while loading current user {UserId}.",
                userId);

            return ApiResponse<AuthenticatedUserDto>.ServerErrorResponse(
                "An error occurred while loading user details.");
        }
    }

    private async Task<AuthResponseDto> BuildAuthResponseAsync(ApplicationUser user)
    {
        var token = await _jwtTokenService.GenerateTokenAsync(user);
        var expiry = _jwtTokenService.GetTokenExpiry();
        var roles = await _userRepository.GetRolesAsync(user);

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