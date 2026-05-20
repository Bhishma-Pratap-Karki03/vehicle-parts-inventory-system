using System.Security.Claims;
using Coursework.Application.DTOs.SalesInvoices;
using Coursework.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Coursework.API.Controllers;

[Route("api/sales-invoices")]
[ApiController]
[Authorize(Roles = "Staff")]
public class SalesInvoicesController : ControllerBase
{
    private readonly ISalesInvoiceService _salesInvoiceService;
    private readonly IHttpClientFactory _httpClientFactory;

    public SalesInvoicesController(
        ISalesInvoiceService salesInvoiceService,
        IHttpClientFactory httpClientFactory)
    {
        _salesInvoiceService = salesInvoiceService;
        _httpClientFactory = httpClientFactory;
    }

    [HttpGet("customers/options")]
    public async Task<IActionResult> GetCustomerOptions()
    {
        var response = await _salesInvoiceService.GetCustomerOptionsAsync();

        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("customers/{customerId}/vehicles/options")]
    public async Task<IActionResult> GetCustomerVehicleOptions(string customerId)
    {
        var response = await _salesInvoiceService.GetCustomerVehicleOptionsAsync(customerId);

        return StatusCode(response.StatusCode, response);
    }

    [HttpPost]
    public async Task<IActionResult> CreateSalesInvoice(
        [FromBody] CreateSalesInvoiceDto dto)
    {
        var staffId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? "dev-admin-user";

        if (string.IsNullOrWhiteSpace(staffId))
        {
            return Unauthorized(new
            {
                success = false,
                message = "User id was not found in token."
            });
        }

        var response = await _salesInvoiceService.CreateSalesInvoiceAsync(
            dto,
            staffId);

        return StatusCode(response.StatusCode, response);
    }

    [HttpGet]
    public async Task<IActionResult> GetSalesInvoices(
        [FromQuery] SalesInvoiceQueryParameters queryParameters)
    {
        var response = await _salesInvoiceService.GetSalesInvoicesAsync(
            queryParameters);

        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetSalesInvoiceById(int id)
    {
        var response = await _salesInvoiceService.GetSalesInvoiceByIdAsync(id);

        return StatusCode(response.StatusCode, response);
    }

    [HttpPost("{id:int}/payments")]
    public async Task<IActionResult> AddPayment(
        int id,
        [FromBody] AddSalesInvoicePaymentDto dto)
    {
        var response = await _salesInvoiceService.AddPaymentAsync(id, dto);

        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("{id:int}/download")]
    public async Task<IActionResult> GetSalesInvoicePdfDownloadUrl(int id)
    {
        var response = await _salesInvoiceService.GetSalesInvoicePdfDownloadUrlAsync(id);

        return StatusCode(response.StatusCode, response);
    }
    [HttpPost("{id:int}/email")]
    public async Task<IActionResult> SendSalesInvoiceEmail(
        int id,
        [FromBody] SendSalesInvoiceEmailDto dto)
    {
        var response = await _salesInvoiceService.SendSalesInvoiceEmailAsync(
            id,
            dto);

        return StatusCode(response.StatusCode, response);
    }
    
    
    [HttpGet("{id:int}/download-pdf")]
    public async Task<IActionResult> DownloadSalesInvoicePdf(int id)
    {
        var response = await _salesInvoiceService.GetSalesInvoicePdfDownloadUrlAsync(id);

        if (!response.Success || string.IsNullOrWhiteSpace(response.Data))
        {
            return StatusCode(response.StatusCode, response);
        }

        var httpClient = _httpClientFactory.CreateClient();

        var pdfBytes = await httpClient.GetByteArrayAsync(response.Data);

        var fileName = $"sales-invoice-{id}.pdf";

        return File(
            pdfBytes,
            "application/pdf",
            fileName);
    }
}
