using System.Linq.Expressions;

namespace Coursework.Application.Interfaces;

public interface IRepositoryBase<T> where T : class
{
    IQueryable<T> FindAll(bool trackChanges = false);

    Task<List<T>> FindAllAsync(bool trackChanges = false);

    IQueryable<T> FindByCondition(
        Expression<Func<T, bool>> expression,
        bool trackChanges = false);

    T? GetById(int id);

    Task<T?> GetByIdAsync(int id);

    void Create(T entity);

    void Update(T entity);

    void Delete(T entity);

    void AddRange(IEnumerable<T> entities);

    void DeleteRange(IEnumerable<T> entities);

    Task SaveChangesAsync();
}