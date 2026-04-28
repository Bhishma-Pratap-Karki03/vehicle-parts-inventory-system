using Coursework.Application.DTOs.Staff;

namespace Coursework.Application.Interfaces;

public interface IStaffService
{
    Task<object> CreateStaffAsync(CreateStaffDto dto);
    Task<List<object>> GetAllStaffAsync();
    Task<bool> UpdateRoleAsync(string userId, string role);
}