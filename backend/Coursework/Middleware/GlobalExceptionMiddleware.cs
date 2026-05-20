using System.Net;
using System.Text.Json;
using Coursework.Application.Common;
using Microsoft.EntityFrameworkCore;

namespace Coursework.Middleware;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IWebHostEnvironment _environment;

    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger,
        IWebHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception exception)
        {
            await HandleExceptionAsync(context, exception);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        if (context.Response.HasStarted)
        {
            _logger.LogWarning(
                exception,
                "Unhandled exception occurred after the response started for {Method} {Path}.",
                context.Request.Method,
                context.Request.Path);

            throw exception;
        }

        _logger.LogError(
            exception,
            "Unhandled exception occurred for {Method} {Path}.",
            context.Request.Method,
            context.Request.Path);

        var statusCode = ResolveStatusCode(exception);
        var message = statusCode == (int)HttpStatusCode.InternalServerError
            ? "An unexpected error occurred. Please try again later."
            : exception.Message;

        var errors = _environment.IsDevelopment()
            ? new List<string>
            {
                exception.Message,
                exception.StackTrace ?? string.Empty
            }
            : null;

        var response = ApiResponse<object>.FailureResponse(
            message,
            statusCode,
            errors);

        context.Response.Clear();
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";

        var json = JsonSerializer.Serialize(
            response,
            new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

        await context.Response.WriteAsync(json);
    }

    private static int ResolveStatusCode(Exception exception)
    {
        return exception switch
        {
            KeyNotFoundException => (int)HttpStatusCode.NotFound,
            UnauthorizedAccessException => (int)HttpStatusCode.Forbidden,
            ArgumentException => (int)HttpStatusCode.BadRequest,
            InvalidOperationException => (int)HttpStatusCode.BadRequest,
            FormatException => (int)HttpStatusCode.BadRequest,
            DbUpdateException => (int)HttpStatusCode.BadRequest,
            _ => (int)HttpStatusCode.InternalServerError,
        };
    }
}
