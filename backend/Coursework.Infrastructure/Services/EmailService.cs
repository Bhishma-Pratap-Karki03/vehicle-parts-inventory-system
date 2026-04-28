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

        var smtpClient = new SmtpClient
        {
            Host = emailSettings["Host"],
            Port = int.Parse(emailSettings["Port"]),
            EnableSsl = bool.Parse(emailSettings["EnableSsl"]),
            Credentials = new NetworkCredential(
                emailSettings["Username"],
                emailSettings["Password"])
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(emailSettings["Username"]),
            Subject = subject,
            Body = body,
            IsBodyHtml = false
        };

        mailMessage.To.Add(toEmail);

        await smtpClient.SendMailAsync(mailMessage);
    }
}