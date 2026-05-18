namespace Coursework.Application.Interfaces;

using Coursework.Application.DTOs.Emails;

public interface IEmailAttachmentService
{
    Task SendEmailWithAttachmentAsync(
        string toEmail,
        string subject,
        string plainTextContent,
        string htmlContent,
        EmailAttachmentDto attachment);
    
}