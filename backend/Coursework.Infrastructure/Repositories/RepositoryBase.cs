using System.Linq.Expressions;
using Coursework.Application.Interfaces;
using Coursework.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Coursework.Infrastructure.Repositories;

public class RepositoryBase<T> : IRepositoryBase<T> where T : class
{
    protected readonly ApplicationDbContext Context;

    public RepositoryBase(ApplicationDbContext context)
    {
        Context = context;
    }

    public IQueryable<T> FindAll(bool trackChanges = false)
    {
        return trackChanges
            ? Context.Set<T>()
            : Context.Set<T>().AsNoTracking();
    }

    public async Task<List<T>> FindAllAsync(bool trackChanges = false)
    {
        return await FindAll(trackChanges).ToListAsync();
    }

    public IQueryable<T> FindByCondition(
        Expression<Func<T, bool>> expression,
        bool trackChanges = false)
    {
        return trackChanges
            ? Context.Set<T>().Where(expression)
            : Context.Set<T>().Where(expression).AsNoTracking();
    }

    public T? GetById(int id)
    {
        return Context.Set<T>().Find(id);
    }

    public async Task<T?> GetByIdAsync(int id)
    {
        return await Context.Set<T>().FindAsync(id);
    }

    public void Create(T entity)
    {
        Context.Set<T>().Add(entity);
    }

    public void Update(T entity)
    {
        Context.Set<T>().Update(entity);
    }

    public void Delete(T entity)
    {
        Context.Set<T>().Remove(entity);
    }

    public void AddRange(IEnumerable<T> entities)
    {
        Context.Set<T>().AddRange(entities);
    }

    public void DeleteRange(IEnumerable<T> entities)
    {
        Context.Set<T>().RemoveRange(entities);
    }

    public async Task SaveChangesAsync()
    {
        await Context.SaveChangesAsync();
    }
}