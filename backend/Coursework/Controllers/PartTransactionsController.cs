using System.Security.Claims;
using Coursework.Application.Common;
using Coursework.Application.DTOs.PartTransactions;
using Coursework.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Coursework.Controllers;

[ApiController]
[Route("api/part-transactions")]
[Authorize(Roles = "Admin")]
public class PartTransactionsController : ControllerBase
{
    private readonly IPartTransactionService _partTransactionService;

    public PartTransactionsController(IPartTransactionService partTransactionService)
    {
        _partTransactionService = partTransactionService;
    }

    [HttpPost("adjust-stock")]
    public async Task<IActionResult> AdjustPartStock([FromBody] AdjustPartStockDto dto)
    {
        var createdById = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(createdById))
        {
            var unauthorizedResponse = ApiResponse<object>.UnauthorizedResponse(
                "User id was not found in token.");

            return StatusCode(unauthorizedResponse.StatusCode, unauthorizedResponse);
        }

        var response = await _partTransactionService.AdjustPartStockAsync(
            dto,
            createdById);

        return StatusCode(response.StatusCode, response);
    }

    [HttpGet]
    public async Task<IActionResult> GetPartTransactions(
        [FromQuery] PartTransactionQueryDto query)
    {
        var response = await _partTransactionService.GetPartTransactionsAsync(query);

        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("{partTransactionId:int}")]
    public async Task<IActionResult> GetPartTransactionById(
        int partTransactionId)
    {
        var response = await _partTransactionService.GetPartTransactionByIdAsync(
            partTransactionId);

        return StatusCode(response.StatusCode, response);
    }
}
