using Coursework.Application.Common;
using Coursework.Application.DTOs.Reviews;
using Coursework.Application.Interfaces;
using Coursework.Domain.Entities;
using Coursework.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Coursework.Application.Services;

public class ReviewService : IReviewService
{
    private readonly IReviewRepository _reviewRepository;
    private readonly IAppointmentRepository _appointmentRepository;

    public ReviewService(
        IReviewRepository reviewRepository,
        IAppointmentRepository appointmentRepository)
    {
        _reviewRepository = reviewRepository;
        _appointmentRepository = appointmentRepository;
    }

    public async Task<ApiResponse<ReviewResponseDto>> CreateReviewAsync(CreateReviewDto dto)
    {
        var appointment = await _appointmentRepository
            .FindByCondition(a =>
                a.AppointmentId == dto.AppointmentId &&
                a.CustomerId == dto.CustomerId)
            .FirstOrDefaultAsync();

        if (appointment == null)
        {
            return ApiResponse<ReviewResponseDto>.NotFoundResponse(
                "Appointment not found for this customer.");
        }

        if (appointment.Status != AppointmentStatus.Completed)
        {
            return ApiResponse<ReviewResponseDto>.FailureResponse(
                "Review can only be submitted after the appointment is completed.", 400);
        }

        var alreadyReviewed = await _reviewRepository
            .FindByCondition(r => r.AppointmentId == dto.AppointmentId)
            .AnyAsync();

        if (alreadyReviewed)
        {
            return ApiResponse<ReviewResponseDto>.ConflictResponse(
                "You have already submitted a review for this appointment.");
        }

        var review = new Review
        {
            CustomerId = dto.CustomerId,
            AppointmentId = dto.AppointmentId,
            Rating = dto.Rating,
            Comment = dto.Comment.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _reviewRepository.Create(review);
        await _reviewRepository.SaveChangesAsync();

        return ApiResponse<ReviewResponseDto>.CreatedResponse(
            MapReviewToDto(review),
            "Review submitted successfully.");
    }

    public async Task<ApiResponse<ReviewResponseDto>> GetReviewByAppointmentAsync(int appointmentId)
    {
        var review = await _reviewRepository
            .FindByCondition(r => r.AppointmentId == appointmentId)
            .Select(r => new ReviewResponseDto
            {
                ReviewId = r.ReviewId,
                CustomerId = r.CustomerId,
                AppointmentId = r.AppointmentId,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (review == null)
        {
            return ApiResponse<ReviewResponseDto>.NotFoundResponse(
                "Review not found for this appointment.");
        }

        return ApiResponse<ReviewResponseDto>.SuccessResponse(
            review,
            "Review loaded successfully.");
    }

    private static ReviewResponseDto MapReviewToDto(Review review)
    {
        return new ReviewResponseDto
        {
            ReviewId = review.ReviewId,
            CustomerId = review.CustomerId,
            AppointmentId = review.AppointmentId,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };
    }
}