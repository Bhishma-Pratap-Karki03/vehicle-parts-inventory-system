using Coursework.Application.DTOs.PartTransactions;
using Coursework.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Coursework.Controllers;

[ApiController]
[Route("api/part-transactions")]
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
        // Temporary default user for testing without JWT/authentication.
        // Later replace this with logged-in user's id from token.
        var createdById = "dev-admin-user";

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