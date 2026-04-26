using System.Net;
using System.Net.Mail;

namespace Coursework.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(string toEmail, string subject, string body)
    {
        var host = _configuration["EmailSettings:Host"];
        var port = int.Parse(_configuration["EmailSettings:Port"] ?? "587");
        var username = _configuration["EmailSettings:Username"];
        var password = _configuration["EmailSettings:Password"];
        var fromEmail = _configuration["EmailSettings:FromEmail"];

        if (string.IsNullOrWhiteSpace(host) ||
            string.IsNullOrWhiteSpace(username) ||
            string.IsNullOrWhiteSpace(password) ||
            string.IsNullOrWhiteSpace(fromEmail))
        {
            Console.WriteLine($"EMAIL NOT SENT. Missing SMTP settings. To: {toEmail}, Subject: {subject}");
            return;
        }

        using var client = new SmtpClient(host, port)
        {
            EnableSsl = true,
            Credentials = new NetworkCredential(username, password)
        };

        var message = new MailMessage(fromEmail, toEmail, subject, body);

        await client.SendMailAsync(message);
    }
}
