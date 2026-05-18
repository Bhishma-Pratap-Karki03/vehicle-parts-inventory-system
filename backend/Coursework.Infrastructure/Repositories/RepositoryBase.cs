using System.Linq.Expressions;
using Coursework.Application.Interfaces;
using Coursework.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Coursework.Infrastructure.Repositories;

public class RepositoryBase<T>(ApplicationDbContext context) : IRepositoryBase<T> where T : class
{
    protected ApplicationDbContext Context { get; } = context;

    public IQueryable<T> FindAll(bool trackChanges = false) =>
        !trackChanges
            ? Context.Set<T>().AsNoTracking()
            : Context.Set<T>();

    public async Task<List<T>> FindAllAsync(bool trackChanges = false) =>
        !trackChanges
            ? await Context.Set<T>().AsNoTracking().ToListAsync()
            : await Context.Set<T>().ToListAsync();

    public IQueryable<T> FindByCondition(
        Expression<Func<T, bool>> expression,
        bool trackChanges = false) =>
        !trackChanges
            ? Context.Set<T>().Where(expression).AsNoTracking()
            : Context.Set<T>().Where(expression);

    public T? GetById(int id) => Context.Set<T>().Find(id);

    public async Task<T?> GetByIdAsync(int id) => await Context.Set<T>().FindAsync(id);

    public void Create(T entity) => Context.Set<T>().Add(entity);

    public void Update(T entity) => Context.Set<T>().Update(entity);

    public void Delete(T entity) => Context.Set<T>().Remove(entity);

    public void AddRange(IEnumerable<T> entities) => Context.Set<T>().AddRange(entities);

    public void DeleteRange(IEnumerable<T> entities) => Context.Set<T>().RemoveRange(entities);

    public async Task SaveChangesAsync() => await Context.SaveChangesAsync();
<<<<<<< HEAD
}
=======
}
>>>>>>> origin/development
