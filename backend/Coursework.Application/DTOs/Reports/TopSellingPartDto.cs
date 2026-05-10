namespace Coursework.Application.DTOs.Reports;

public class TopSellingPartDto
{
    public string PartName { get; set; } = string.Empty;
    public string PartNumber { get; set; } = string.Empty;
    public int QuantitySold { get; set; }
    public decimal Revenue { get; set; }
    public int CurrentStock { get; set; }
}