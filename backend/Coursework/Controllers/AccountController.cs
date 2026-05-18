using System.Security.Claims;
using Coursework.Application.Common;
using Coursework.Application.DTOs.Account;
using Coursework.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Coursework.Controllers;

[ApiController]
[Route("api/account")]
[Authorize]
public class AccountController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;

    public AccountController(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
        {
            var unauthorizedResponse = ApiResponse<object>.UnauthorizedResponse(
                "User id was not found in token.");

            return StatusCode(unauthorizedResponse.StatusCode, unauthorizedResponse);
        }

        var user = await _userManager.FindByIdAsync(userId);

        if (user == null || !user.IsActive)
        {
            var notFoundResponse = ApiResponse<object>.NotFoundResponse(
                "User account was not found or is inactive.");

            return StatusCode(notFoundResponse.StatusCode, notFoundResponse);
        }

        var result = await _userManager.ChangePasswordAsync(
            user,
            dto.CurrentPassword,
            dto.NewPassword);

        if (!result.Succeeded)
        {
            var response = ApiResponse<object>.FailureResponse(
                "Failed to change password.",
                errors: result.Errors.Select(e => e.Description).ToList());

            return StatusCode(response.StatusCode, response);
        }

        var successResponse = ApiResponse<object>.SuccessResponse(
            true,
            "Password changed successfully.");

        return StatusCode(successResponse.StatusCode, successResponse);
    }
}
