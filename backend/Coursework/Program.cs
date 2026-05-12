using Coursework.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

// Authentication is temporarily disabled until the login module is integrated.
// Re-enable these middleware calls when protected endpoints are restored.
// app.UseAuthentication();
// app.UseAuthorization();

app.MapControllers();

app.Run();
