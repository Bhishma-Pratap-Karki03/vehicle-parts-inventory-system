using Coursework.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Net;
using System.Net.Mail;

namespace Coursework.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        var emailSettings = _configuration.GetSection("EmailSettings");
        var host = emailSettings["Host"]
            ?? throw new InvalidOperationException("Email host is not configured.");
        var port = emailSettings["Port"]
            ?? throw new InvalidOperationException("Email port is not configured.");
        var enableSsl = emailSettings["EnableSsl"]
            ?? throw new InvalidOperationException("Email SSL setting is not configured.");
        var username = emailSettings["Username"]
            ?? throw new InvalidOperationException("Email username is not configured.");
        var password = emailSettings["Password"]
            ?? throw new InvalidOperationException("Email password is not configured.");

        var smtpClient = new SmtpClient
        {
            Host = host,
            Port = int.Parse(port),
            EnableSsl = bool.Parse(enableSsl),
            Credentials = new NetworkCredential(
                username,
                password)
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(username),
            Subject = subject,
            Body = body,
            IsBodyHtml = false
        };

        mailMessage.To.Add(toEmail);

        await smtpClient.SendMailAsync(mailMessage);
    }
}
