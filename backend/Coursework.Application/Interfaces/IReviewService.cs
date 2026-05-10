using Coursework.Application.Common;
using Coursework.Application.DTOs.Reviews;

namespace Coursework.Application.Interfaces;

public interface IReviewService
{
    Task<ApiResponse<ReviewResponseDto>> CreateReviewAsync(CreateReviewDto dto);

    Task<ApiResponse<ReviewResponseDto>> GetReviewByAppointmentAsync(int appointmentId);
}