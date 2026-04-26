namespace Coursework.Services;

public interface IEmailService
{
    Task SendEmailAsync(string toEmail, string subject, string body);
}