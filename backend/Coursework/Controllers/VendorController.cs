using System.Data;
using System.Data.Common;
using Coursework.Application.Common;
using Coursework.DTOs;
using Coursework.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Coursework.Controllers;

[ApiController]
[Route("api/admin/vendors")]
[AllowAnonymous]
public class VendorController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public VendorController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var result = await _context.Vendors
            .OrderByDescending(v => v.CreatedAt)
            .Select(v => new
            {
                v.VendorId,
                v.VendorName,
                v.ContactPerson,
                v.Email,
                v.Phone,
                v.Address,
                v.IsActive,
                v.CreatedAt,
                v.UpdatedAt
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.SuccessResponse(result));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateVendorRequest dto)
    {
        var now = DateTime.UtcNow;
        var vendorId = await ExecuteScalarAsync<int>(
            """
            INSERT INTO "Vendors"
                ("VendorName", "ContactPerson", "Email", "Phone", "Address", "IsActive", "CreatedAt")
            VALUES
                (@vendorName, @contactPerson, @email, @phone, @address, @isActive, @createdAt)
            RETURNING "VendorId";
            """,
            ("@vendorName", dto.VendorName),
            ("@contactPerson", dto.ContactPerson),
            ("@email", dto.Email),
            ("@phone", dto.Phone),
            ("@address", dto.Address),
            ("@isActive", true),
            ("@createdAt", now));

        var result = new
        {
            VendorId = vendorId,
            dto.VendorName,
            dto.ContactPerson,
            dto.Email,
            dto.Phone,
            dto.Address,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = (DateTime?)null
        };

        return StatusCode(
            201,
            ApiResponse<object>.CreatedResponse(result, "Vendor created successfully."));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateVendorRequest dto)
    {
        var rowsAffected = await ExecuteNonQueryAsync(
            """
            UPDATE "Vendors"
            SET
                "VendorName" = @vendorName,
                "ContactPerson" = @contactPerson,
                "Email" = @email,
                "Phone" = @phone,
                "Address" = @address,
                "IsActive" = @isActive,
                "UpdatedAt" = @updatedAt
            WHERE "VendorId" = @vendorId;
            """,
            ("@vendorId", id),
            ("@vendorName", dto.VendorName),
            ("@contactPerson", dto.ContactPerson),
            ("@email", dto.Email),
            ("@phone", dto.Phone),
            ("@address", dto.Address),
            ("@isActive", dto.IsActive),
            ("@updatedAt", DateTime.UtcNow));

        if (rowsAffected == 0)
            return NotFound(ApiResponse<object>.ErrorResponse("Vendor not found."));

        return Ok(ApiResponse<object>.SuccessResponse(true, "Vendor updated successfully."));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var rowsAffected = await ExecuteNonQueryAsync(
            """
            UPDATE "Vendors"
            SET "IsActive" = false,
                "UpdatedAt" = @updatedAt
            WHERE "VendorId" = @vendorId;
            """,
            ("@vendorId", id),
            ("@updatedAt", DateTime.UtcNow));

        if (rowsAffected == 0)
            return NotFound(ApiResponse<object>.ErrorResponse("Vendor not found."));

        return Ok(ApiResponse<object>.SuccessResponse(true, "Vendor deleted successfully."));
    }

    private async Task<T> ExecuteScalarAsync<T>(
        string sql,
        params (string Name, object? Value)[] parameters)
    {
        using var command = await CreateCommandAsync(sql, parameters);
        var result = await command.ExecuteScalarAsync();

        return result is T typedResult
            ? typedResult
            : (T)Convert.ChangeType(result, typeof(T));
    }

    private async Task<int> ExecuteNonQueryAsync(
        string sql,
        params (string Name, object? Value)[] parameters)
    {
        using var command = await CreateCommandAsync(sql, parameters);
        return await command.ExecuteNonQueryAsync();
    }

    private async Task<DbCommand> CreateCommandAsync(
        string sql,
        params (string Name, object? Value)[] parameters)
    {
        var connection = _context.Database.GetDbConnection();

        if (connection.State != ConnectionState.Open)
            await connection.OpenAsync();

        var command = connection.CreateCommand();
        command.CommandText = sql;

        foreach (var parameter in parameters)
            command.Parameters.Add(CreateParameter(command, parameter.Name, parameter.Value));

        return command;
    }

    private static DbParameter CreateParameter(DbCommand command, string name, object? value)
    {
        var parameter = command.CreateParameter();
        parameter.ParameterName = name;
        parameter.Value = value ?? DBNull.Value;

        return parameter;
    }
}
