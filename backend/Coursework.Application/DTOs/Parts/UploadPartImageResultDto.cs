namespace Coursework.Application.DTOs.Parts;

public class UploadPartImageResultDto
{
    public int PartId { get; set; }

    public string ImageUrl { get; set; } = string.Empty;

    public string ImagePublicId { get; set; } = string.Empty;
}