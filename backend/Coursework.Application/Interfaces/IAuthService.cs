using Coursework.Application.Common;
using Coursework.Application.DTOs.Auth;

namespace Coursework.Application.Interfaces;

public interface IAuthService
{
    Task<ApiResponse<LoginResponseDto>> LoginAsync(LoginDto dto);
}