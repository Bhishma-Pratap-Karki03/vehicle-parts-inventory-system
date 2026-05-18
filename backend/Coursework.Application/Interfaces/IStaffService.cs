using Coursework.Application.DTOs.Staff;

namespace Coursework.Application.Interfaces;

public interface IStaffService
{
    Task<object> CreateStaffAsync(CreateStaffDto dto);
    Task<List<object>> GetAllStaffAsync();
    Task<bool> UpdateStaffAsync(string userId, UpdateStaffDto dto);
    Task<bool> UpdateRoleAsync(string userId, string role);
    Task<bool> DeleteStaffAsync(string userId);
}
