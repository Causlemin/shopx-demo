using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Settings;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace Infrastructure.Repositories
{
    public class OrderRepository : IOrderRepository, IOrderStatusRepository
    {
        private readonly IMongoCollection<Order> _orders;
        
        public OrderRepository(IOptions<MongoDbSettings> settings)
        {
            var mongoClient = new MongoClient(settings.Value.ConnectionString);
            var database = mongoClient.GetDatabase(settings.Value.DatabaseName);
            _orders = database.GetCollection<Order>("Orders");
            
            // Indexes
            var orderNumberIndex = new CreateIndexModel<Order>(
                Builders<Order>.IndexKeys.Ascending(o => o.OrderNumber),
                new CreateIndexOptions { Unique = true }
            );
            _orders.Indexes.CreateOne(orderNumberIndex);
            
            var userIdIndex = new CreateIndexModel<Order>(
                Builders<Order>.IndexKeys.Ascending(o => o.UserId)
            );
            _orders.Indexes.CreateOne(userIdIndex);
        }
        
        public async Task<Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _orders.Find(o => o.Id == id).FirstOrDefaultAsync(cancellationToken);
        }
        
        public async Task<Order?> GetByOrderNumberAsync(string orderNumber, CancellationToken cancellationToken = default)
        {
            return await _orders.Find(o => o.OrderNumber == orderNumber).FirstOrDefaultAsync(cancellationToken);
        }
        
        public async Task<IEnumerable<Order>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            return await _orders.Find(o => o.UserId == userId).ToListAsync(cancellationToken);
        }
        
        public async Task CreateAsync(Order order, CancellationToken cancellationToken = default)
        {
            await _orders.InsertOneAsync(order, cancellationToken: cancellationToken);
        }
        
        public async Task UpdateStatusAsync(Guid id, string status, CancellationToken cancellationToken = default)
        {
            var update = Builders<Order>.Update
                .Set(o => o.Status, status)
                .Set(o => o.UpdatedAt, DateTime.UtcNow);
            await _orders.UpdateOneAsync(o => o.Id == id, update, cancellationToken: cancellationToken);
        }
        
        public async Task UpdatePaymentStatusAsync(Guid id, string paymentStatus, CancellationToken cancellationToken = default)
        {
            var update = Builders<Order>.Update
                .Set(o => o.PaymentStatus, paymentStatus)
                .Set(o => o.UpdatedAt, DateTime.UtcNow);
            await _orders.UpdateOneAsync(o => o.Id == id, update, cancellationToken: cancellationToken);
        }
    }
}