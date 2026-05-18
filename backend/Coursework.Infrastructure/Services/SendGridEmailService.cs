using Coursework.Application.DTOs.Emails;
using Coursework.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace Coursework.Infrastructure.Services;

public class SendGridEmailService : IEmailAttachmentService
{
    private readonly SendGridClient _client;
    private readonly EmailAddress _fromEmail;

    public SendGridEmailService(IConfiguration configuration)
    {
        var apiKey = configuration["SendGrid:ApiKey"];
        var fromEmail = configuration["SendGrid:FromEmail"];
        var fromName = configuration["SendGrid:FromName"] ?? "AutoCare IMS";

        if (string.IsNullOrWhiteSpace(apiKey) ||
            string.IsNullOrWhiteSpace(fromEmail))
        {
            throw new InvalidOperationException("SendGrid configuration is missing.");
        }

        _client = new SendGridClient(apiKey);
        _fromEmail = new EmailAddress(fromEmail, fromName);
    }

    public async Task SendEmailWithAttachmentAsync(
        string toEmail,
        string subject,
        string plainTextContent,
        string htmlContent,
        EmailAttachmentDto attachment)
    {
        if (string.IsNullOrWhiteSpace(toEmail))
        {
            throw new InvalidOperationException("Recipient email is required.");
        }

        var to = new EmailAddress(toEmail);

        var message = MailHelper.CreateSingleEmail(
            _fromEmail,
            to,
            subject,
            plainTextContent,
            htmlContent);

        var base64Content = Convert.ToBase64String(attachment.Content);

        message.AddAttachment(
            attachment.FileName,
            base64Content,
            attachment.ContentType);

        var response = await _client.SendEmailAsync(message);

        if (!response.IsSuccessStatusCode)
        {
            var responseBody = await response.Body.ReadAsStringAsync();

            throw new InvalidOperationException(
                $"SendGrid email failed with status code {(int)response.StatusCode}: {responseBody}");
        }
    }
}