namespace Coursework.Application.Common;

public class ApiResponse<T>
{
    public bool Success { get; set; }

    public string Message { get; set; } = string.Empty;

    public T? Data { get; set; }

    public List<string>? Errors { get; set; }

    public int StatusCode { get; set; }

    public static ApiResponse<T> SuccessResponse(
        T data,
        string message = "Request completed successfully.",
        int statusCode = 200)
    {
        return new ApiResponse<T>
        {
            Success = true,
            Message = message,
            Data = data,
            StatusCode = statusCode
        };
    }

    public static ApiResponse<T> CreatedResponse(
        T data,
        string message = "Resource created successfully.")
    {
        return new ApiResponse<T>
        {
            Success = true,
            Message = message,
            Data = data,
            StatusCode = 201
        };
    }

    public static ApiResponse<T> FailureResponse(
        string message,
        int statusCode = 400,
        List<string>? errors = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Errors = errors,
            StatusCode = statusCode
        };
    }

    public static ApiResponse<T> NotFoundResponse(
        string message = "Resource not found.")
    {
        return FailureResponse(message, 404);
    }

    public static ApiResponse<T> ConflictResponse(
        string message = "Resource conflict occurred.")
    {
        return FailureResponse(message, 409);
    }

    public static ApiResponse<T> UnauthorizedResponse(
        string message = "Unauthorized access.")
    {
        return FailureResponse(message, 401);
    }

    public static ApiResponse<T> ForbiddenResponse(
        string message = "Forbidden access.")
    {
        return FailureResponse(message, 403);
    }

    public static ApiResponse<T> ServerErrorResponse(
        string message = "An unexpected error occurred.")
    {
        return FailureResponse(message, 500);
    }

    public static ApiResponse<T> ErrorResponse(
        string message,
        List<string>? errors = null,
        int statusCode = 400)
    {
        return FailureResponse(message, statusCode, errors);
    }
}
