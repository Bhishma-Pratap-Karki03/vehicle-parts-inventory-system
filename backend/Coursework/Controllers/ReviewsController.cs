using System.Security.Claims;
using Coursework.Application.Common;
using Coursework.Application.DTOs.Reviews;
using Coursework.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Coursework.Controllers;

[ApiController]
[Route("api/reviews")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [Authorize(Roles = "Customer")]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<ReviewResponseDto>>> CreateReview(CreateReviewDto dto)
    {
        var customerId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(customerId))
        {
            return StatusCode(
                StatusCodes.Status401Unauthorized,
                ApiResponse<ReviewResponseDto>.UnauthorizedResponse("User identity is not available."));
        }

        dto.CustomerId = customerId;

        var response = await _reviewService.CreateReviewAsync(dto);
        return StatusCode(response.StatusCode, response);
    }

    [Authorize(Roles = "Customer")]
    [HttpGet("appointment/{appointmentId}")]
    public async Task<ActionResult<ApiResponse<ReviewResponseDto>>> GetReviewByAppointment(int appointmentId)
    {
        var customerId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(customerId))
        {
            return StatusCode(
                StatusCodes.Status401Unauthorized,
                ApiResponse<ReviewResponseDto>.UnauthorizedResponse("User identity is not available."));
        }

        var response = await _reviewService.GetCustomerReviewByAppointmentAsync(appointmentId, customerId);
        return StatusCode(response.StatusCode, response);
    }

    [Authorize(Roles = "Staff")]
    [HttpGet("appointment/{appointmentId}/staff")]
    public async Task<ActionResult<ApiResponse<ReviewResponseDto>>> GetStaffReviewByAppointment(int appointmentId)
    {
        var response = await _reviewService.GetStaffReviewByAppointmentAsync(appointmentId);
        return StatusCode(response.StatusCode, response);
    }

    private string? GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier);
    }
}
