using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Settings;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace Infrastructure.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly IMongoCollection<Product> _products;
        
        public ProductRepository(IOptions<MongoDbSettings> settings)
        {
            var mongoClient = new MongoClient(settings.Value.ConnectionString);
            var database = mongoClient.GetDatabase(settings.Value.DatabaseName);
            _products = database.GetCollection<Product>("Products");
            
            // Indexes
            var categoryIndex = new CreateIndexModel<Product>(
                Builders<Product>.IndexKeys.Ascending(p => p.Category)
            );
            _products.Indexes.CreateOne(categoryIndex);
            
            var priceIndex = new CreateIndexModel<Product>(
                Builders<Product>.IndexKeys.Ascending(p => p.Price)
            );
            _products.Indexes.CreateOne(priceIndex);
        }
        
        public async Task<Product?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _products.Find(p => p.Id == id).FirstOrDefaultAsync(cancellationToken);
        }
        
        public async Task<IEnumerable<Product>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _products.Find(p => p.IsActive).ToListAsync(cancellationToken);
        }
        
        public async Task<IEnumerable<Product>> GetByCategoryAsync(string category, CancellationToken cancellationToken = default)
        {
            return await _products.Find(p => p.Category == category && p.IsActive).ToListAsync(cancellationToken);
        }
        
        public async Task<IEnumerable<Product>> GetActiveProductsAsync(CancellationToken cancellationToken = default)
        {
            return await _products.Find(p => p.IsActive).ToListAsync(cancellationToken);
        }
        
        public async Task CreateAsync(Product product, CancellationToken cancellationToken = default)
        {
            await _products.InsertOneAsync(product, cancellationToken: cancellationToken);
        }
        
        public async Task UpdateAsync(Product product, CancellationToken cancellationToken = default)
        {
            product.UpdatedAt = DateTime.UtcNow;
            await _products.ReplaceOneAsync(p => p.Id == product.Id, product, cancellationToken: cancellationToken);
        }
        
        public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            var update = Builders<Product>.Update
                .Set(p => p.IsActive, false)
                .Set(p => p.UpdatedAt, DateTime.UtcNow);
            await _products.UpdateOneAsync(p => p.Id == id, update, cancellationToken: cancellationToken);
        }
        
        public async Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _products.Find(p => p.Id == id).AnyAsync(cancellationToken);
        }
        
        public async Task UpdateStockAsync(Guid id, int quantity, CancellationToken cancellationToken = default)
        {
            var update = Builders<Product>.Update
                .Inc(p => p.Stock, -quantity)
                .Set(p => p.UpdatedAt, DateTime.UtcNow);
            await _products.UpdateOneAsync(p => p.Id == id, update, cancellationToken: cancellationToken);
        }
    }
}