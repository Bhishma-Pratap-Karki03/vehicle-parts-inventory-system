using Coursework.Application.Common;
using Coursework.Application.DTOs.Reviews;
using Coursework.Application.Interfaces;
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

    [HttpPost]
    public async Task<ActionResult<ApiResponse<ReviewResponseDto>>> CreateReview(CreateReviewDto dto)
    {
        var response = await _reviewService.CreateReviewAsync(dto);
        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("appointment/{appointmentId}")]
    public async Task<ActionResult<ApiResponse<ReviewResponseDto>>> GetReviewByAppointment(int appointmentId)
    {
        var response = await _reviewService.GetReviewByAppointmentAsync(appointmentId);
        return StatusCode(response.StatusCode, response);
    }
}