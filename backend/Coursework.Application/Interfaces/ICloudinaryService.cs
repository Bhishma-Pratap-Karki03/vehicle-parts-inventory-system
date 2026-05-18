using Coursework.Application.DTOs.Cloudinary;

namespace Coursework.Application.Interfaces;

public interface ICloudinaryService
{
    Task<CloudinaryUploadResultDto> UploadImageAsync(
        FileUploadDto file,
        string publicId,
        string folder);

    Task<CloudinaryUploadResultDto> UploadPdfAsync(
        FileUploadDto file,
        string publicId,
        string folder);

    Task DeleteImageAsync(string publicId);

    Task DeletePdfAsync(string publicId);
    
    string GetPdfUrl(string publicId);
}