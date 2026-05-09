namespace Coursework.Application.DTOs.Emails;

public class EmailAttachmentDto
{
    public string FileName { get; set; } = string.Empty;

    public string ContentType { get; set; } = string.Empty;

    public byte[] Content { get; set; } = [];
}