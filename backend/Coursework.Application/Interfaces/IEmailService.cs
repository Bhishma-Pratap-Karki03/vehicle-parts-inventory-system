namespace Coursework.Application.Interfaces;

using Coursework.Application.DTOs.Emails;

public interface IEmailService
{
    Task SendEmailWithAttachmentAsync(
        string toEmail,
        string subject,
        string plainTextContent,
        string htmlContent,
        EmailAttachmentDto attachment);

    Task SendEmailAsync(string toEmail, string subject, string body);
}