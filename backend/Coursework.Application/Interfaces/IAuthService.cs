using Coursework.Application.Common;
using Coursework.Application.DTOs.Auth;

namespace Coursework.Application.Interfaces;

public interface IAuthService
{

    Task<ApiResponse<string>> ChangePasswordAsync(
        ChangePasswordDto dto);

    Task<ApiResponse<AuthResponseDto>> RegisterCustomerAsync(RegisterCustomerDto dto);

    Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginDto dto);

    Task<ApiResponse<AuthenticatedUserDto>> GetCurrentUserAsync(string userId);
}
