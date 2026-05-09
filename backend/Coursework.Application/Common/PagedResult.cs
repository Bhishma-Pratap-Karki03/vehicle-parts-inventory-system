namespace Coursework.Application.Common;

public class PagedResult<T>
{
    public IReadOnlyList<T> Items { get; set; } = [];

    public int PageNumber { get; set; }

    public int PageSize { get; set; }

    public int TotalRecords { get; set; }

    public int TotalPages { get; set; }

    public bool HasPreviousPage => PageNumber > 1;

    public bool HasNextPage => PageNumber < TotalPages;

    public static PagedResult<T> Create(
        IReadOnlyList<T> items,
        int pageNumber,
        int pageSize,
        int totalRecords)
    {
        var totalPages = (int)Math.Ceiling(totalRecords / (double)pageSize);

        return new PagedResult<T>
        {
            Items = items,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalRecords = totalRecords,
            TotalPages = totalPages
        };
    }
}