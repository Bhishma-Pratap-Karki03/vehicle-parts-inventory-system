using System.Security.Claims;
using Coursework.Application.DTOs.PurchaseInvoices;
using Coursework.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Coursework.API.Controllers;

[ApiController]
[Route("api/purchase-invoices")]
[Authorize(Roles = "Admin")]
public class PurchaseInvoicesController : ControllerBase
{
    private readonly IPurchaseInvoiceService _purchaseInvoiceService;
    private readonly IHttpClientFactory _httpClientFactory;

    public PurchaseInvoicesController(
        IPurchaseInvoiceService purchaseInvoiceService,
        IHttpClientFactory httpClientFactory)
    {
        _purchaseInvoiceService = purchaseInvoiceService;
        _httpClientFactory = httpClientFactory;
    }

    [HttpPost]
    public async Task<IActionResult> CreatePurchaseInvoice(
        [FromBody] CreatePurchaseInvoiceDto dto)
    {
        var createdById = "dev-admin-user";

        var response = await _purchaseInvoiceService.CreatePurchaseInvoiceAsync(
            dto,
            createdById);

        return StatusCode(response.StatusCode, response);
    }

    [HttpGet]
    public async Task<IActionResult> GetPurchaseInvoices(
        [FromQuery] PurchaseInvoiceQueryDto query)
    {
        var response = await _purchaseInvoiceService.GetPurchaseInvoicesAsync(query);

        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("{purchaseInvoiceId:int}")]
    public async Task<IActionResult> GetPurchaseInvoiceById(
        int purchaseInvoiceId)
    {
        var response = await _purchaseInvoiceService.GetPurchaseInvoiceByIdAsync(
            purchaseInvoiceId);

        return StatusCode(response.StatusCode, response);
    }

    [HttpPost("{purchaseInvoiceId:int}/send-email")]
    public async Task<IActionResult> SendPurchaseInvoiceEmail(
        int purchaseInvoiceId)
    {
        var response = await _purchaseInvoiceService.SendPurchaseInvoiceEmailAsync(
            purchaseInvoiceId);

        return StatusCode(response.StatusCode, response);
    }
    
    [HttpGet("{purchaseInvoiceId:int}/pdf-url")]
    public async Task<IActionResult> GetPurchaseInvoicePdfUrl(
        int purchaseInvoiceId)
    {
        var response = await _purchaseInvoiceService.GetPurchaseInvoicePdfUrlAsync(
            purchaseInvoiceId);

        return StatusCode(response.StatusCode, response);
    }
    
    [HttpGet("{purchaseInvoiceId:int}/download-pdf")]
    public async Task<IActionResult> DownloadPurchaseInvoicePdf(
        int purchaseInvoiceId)
    {
        var response = await _purchaseInvoiceService.GetPurchaseInvoicePdfUrlAsync(
            purchaseInvoiceId);

        if (!response.Success || string.IsNullOrWhiteSpace(response.Data))
        {
            return StatusCode(response.StatusCode, response);
        }

        var httpClient = _httpClientFactory.CreateClient();

        var pdfBytes = await httpClient.GetByteArrayAsync(response.Data);

        var fileName = $"purchase-invoice-{purchaseInvoiceId}.pdf";

        return File(
            pdfBytes,
            "application/pdf",
            fileName);
    }
}