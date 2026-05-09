using Coursework.Application.Common;
using Coursework.Application.DTOs.PartRequests;
using Coursework.Application.Interfaces;
using Coursework.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Coursework.Controllers;

[ApiController]
[Route("api/part-requests")]
public class PartRequestsController : ControllerBase
{
    private readonly IPartRequestService _partRequestService;

    public PartRequestsController(IPartRequestService partRequestService)
    {
        _partRequestService = partRequestService;
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<PartRequestResponseDto>>> CreatePartRequest(CreatePartRequestDto dto)
    {
        var response = await _partRequestService.CreatePartRequestAsync(dto);
        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("customer/{customerId}")]
    public async Task<ActionResult<ApiResponse<PagedResult<PartRequestResponseDto>>>> GetCustomerPartRequests(
     string customerId,
     [FromQuery] int pageNumber = 1,
     [FromQuery] int pageSize = 10)
    {
        var response = await _partRequestService.GetCustomerPartRequestsAsync(
            customerId,
            pageNumber,
            pageSize);

        return StatusCode(response.StatusCode, response);
    }

    [HttpPut("{id}/cancel")]
    public async Task<ActionResult<ApiResponse<PartRequestResponseDto>>> CancelPartRequest(int id)
    {
        var response = await _partRequestService.CancelPartRequestAsync(id);
        return StatusCode(response.StatusCode, response);
    }


    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<PartRequestResponseDto>>> GetPartRequestById(int id)
    {
        var response = await _partRequestService.GetPartRequestByIdAsync(id);
        return StatusCode(response.StatusCode, response);
    }
}