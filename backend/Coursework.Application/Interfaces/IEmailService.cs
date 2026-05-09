using Coursework.Application.DTOs.Emails;

namespace Coursework.Application.Interfaces;

public interface IEmailService
{
    Task SendEmailWithAttachmentAsync(
        string toEmail,
        string subject,
        string plainTextContent,
        string htmlContent,
        EmailAttachmentDto attachment);
}