using Coursework.Application.DTOs.Parts;
using Coursework.Application.Interfaces;
using Coursework.Application.DTOs.Cloudinary;
using Microsoft.AspNetCore.Mvc;

namespace Coursework.Controllers;

[ApiController]
[Route("api/[controller]")]
// [Authorize(Roles = "Admin")]
public class PartsController(IPartService partService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAllParts([FromQuery] PartQueryDto query)
    {
        var response = await partService.GetAllAsync(query);
        return StatusCode(response.StatusCode, response);
    }
    
    [HttpGet("summary")]
    public async Task<IActionResult> GetPartsSummary()
    {
        var response = await partService.GetSummaryAsync();
        return StatusCode(response.StatusCode, response);
    }
    
    [HttpGet("vendors/options")]
    public async Task<IActionResult> GetVendorOptions()
    {
        var response = await partService.GetVendorOptionsAsync();
        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("categories/options")]
    public async Task<IActionResult> GetCategoryOptions()
    {
        var response = await partService.GetCategoryOptionsAsync();
        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetPartById([FromRoute] int id)
    {
        var response = await partService.GetByIdAsync(id);
        return StatusCode(response.StatusCode, response);
    }

    [HttpGet("low-stock")]
    public async Task<IActionResult> GetLowStockParts()
    {
        var response = await partService.GetLowStockAsync();
        return StatusCode(response.StatusCode, response);
    }

    [HttpPost]
    public async Task<IActionResult> CreatePart([FromBody] CreatePartDto dto)
    {
        var response = await partService.CreateAsync(dto);

        if (!response.Success)
        {
            return StatusCode(response.StatusCode, response);
        }

        return CreatedAtAction(
            nameof(GetPartById),
            new { id = response.Data?.PartId },
            response);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdatePart(
        [FromRoute] int id,
        [FromBody] UpdatePartDto dto)
    {
        var response = await partService.UpdateAsync(id, dto);
        return StatusCode(response.StatusCode, response);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeletePart([FromRoute] int id)
    {
        var response = await partService.DeleteAsync(id);
        return StatusCode(response.StatusCode, response);
    }
    
    [HttpPost("{id:int}/image")]
    public async Task<IActionResult> UploadPartImage(
        [FromRoute] int id,
        [FromForm] IFormFile image)
    {
        if (image.Length == 0)
        {
            return BadRequest("Image file is required.");
        }

        var fileDto = new FileUploadDto
        {
            Content = image.OpenReadStream(),
            FileName = image.FileName,
            ContentType = image.ContentType,
            Length = image.Length
        };

        var response = await partService.UploadImageAsync(id, fileDto);

        return StatusCode(response.StatusCode, response);
    }

    [HttpPatch("{id:int}/image")]
    public async Task<IActionResult> ReplacePartImage(
        [FromRoute] int id,
        [FromForm] IFormFile image)
    {
        if (image.Length == 0)
        {
            return BadRequest("Image file is required.");
        }

        var fileDto = new FileUploadDto
        {
            Content = image.OpenReadStream(),
            FileName = image.FileName,
            ContentType = image.ContentType,
            Length = image.Length
        };

        var response = await partService.ReplaceImageAsync(id, fileDto);

        return StatusCode(response.StatusCode, response);
    }

    [HttpDelete("{id:int}/image")]
    public async Task<IActionResult> DeletePartImage([FromRoute] int id)
    {
        var response = await partService.DeleteImageAsync(id);
        return StatusCode(response.StatusCode, response);
    }
}