using Coursework.Domain.Entities;

namespace Coursework.Application.Interfaces;

public interface IJwtTokenService
{
    Task<string> GenerateTokenAsync(ApplicationUser user);

    DateTime GetTokenExpiry();
}
