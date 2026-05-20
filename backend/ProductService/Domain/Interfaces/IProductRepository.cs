using Domain.Entities;

namespace Domain.Interfaces
{
    public interface IProductRepository
    {
        Task<Product?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<IEnumerable<Product>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<Product>> GetByCategoryAsync(string category, CancellationToken cancellationToken = default);
        Task<IEnumerable<Product>> GetActiveProductsAsync(CancellationToken cancellationToken = default);
        Task CreateAsync(Product product, CancellationToken cancellationToken = default);
        Task UpdateAsync(Product product, CancellationToken cancellationToken = default);
        Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
        Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default);
        Task UpdateStockAsync(Guid id, int quantity, CancellationToken cancellationToken = default);
    }
}