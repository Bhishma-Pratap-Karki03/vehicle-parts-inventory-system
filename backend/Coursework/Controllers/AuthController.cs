using Coursework.Application.DTOs.Auth;
using Coursework.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Coursework.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var response = await _authService.LoginAsync(dto);

        return StatusCode(response.StatusCode, response);
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangePasswordDto dto)
    {
        var response =
            await _authService.ChangePasswordAsync(dto);

        return StatusCode(response.StatusCode, response);
    }
}