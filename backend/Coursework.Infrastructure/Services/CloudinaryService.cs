using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Coursework.Application.DTOs.Cloudinary;
using Coursework.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Coursework.Infrastructure.Services;

public class CloudinaryService : ICloudinaryService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryService(IConfiguration configuration)
    {
        var cloudName = configuration["Cloudinary:CloudName"];
        var apiKey = configuration["Cloudinary:ApiKey"];
        var apiSecret = configuration["Cloudinary:ApiSecret"];

        if (string.IsNullOrWhiteSpace(cloudName) ||
            string.IsNullOrWhiteSpace(apiKey) ||
            string.IsNullOrWhiteSpace(apiSecret))
        {
            throw new InvalidOperationException("Cloudinary configuration is missing.");
        }

        var account = new Account(cloudName, apiKey, apiSecret);
        _cloudinary = new Cloudinary(account);
    }

    public async Task<CloudinaryUploadResultDto> UploadImageAsync(
        FileUploadDto file,
        string publicId,
        string folder)
    {
        if (file.Length == 0)
        {
            throw new InvalidOperationException("Image file is empty.");
        }

        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, file.Content),
            PublicId = publicId,
            Folder = folder,
            Overwrite = true
        };

        var uploadResult = await _cloudinary.UploadAsync(uploadParams);

        if (uploadResult.Error is not null)
        {
            throw new InvalidOperationException(uploadResult.Error.Message);
        }

        return new CloudinaryUploadResultDto
        {
            PublicId = uploadResult.PublicId
        };
    }

    public async Task DeleteImageAsync(string publicId)
    {
        if (string.IsNullOrWhiteSpace(publicId))
        {
            return;
        }

        var deleteParams = new DeletionParams(publicId);
        await _cloudinary.DestroyAsync(deleteParams);
    }
}