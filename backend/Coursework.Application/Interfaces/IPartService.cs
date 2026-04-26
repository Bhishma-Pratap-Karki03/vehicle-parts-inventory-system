using Coursework.Application.Common;
using Coursework.Application.DTOs.Parts;
using Coursework.Application.DTOs.Cloudinary;

namespace Coursework.Application.Interfaces;

public interface IPartService
{
    Task<ApiResponse<PagedResult<PartDto>>> GetAllAsync(PartQueryDto query);

    Task<ApiResponse<PartDto>> GetByIdAsync(int id);

    Task<ApiResponse<PartDto>> CreateAsync(CreatePartDto dto);

    Task<ApiResponse<PartDto>> UpdateAsync(int id, UpdatePartDto dto);

    Task<ApiResponse<DeletePartResultDto>> DeleteAsync(int id);

    Task<ApiResponse<List<PartDto>>> GetLowStockAsync();
    
    Task<ApiResponse<UploadPartImageResultDto>> UploadImageAsync(
        int id,
        FileUploadDto file);
    
    Task<ApiResponse<string>> DeleteImageAsync(int id);
}