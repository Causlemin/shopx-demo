using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Settings;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace Infrastructure.Repositories
{
    public class CartSnapshotRepository : ICartSnapshotRepository
    {
        private readonly IMongoCollection<CartSnapshot> _collection;

        public CartSnapshotRepository(IOptions<MongoDbSettings> settings)
        {
            var client = new MongoClient(settings.Value.ConnectionString);
            var database = client.GetDatabase(settings.Value.DatabaseName);

            _collection = database.GetCollection<CartSnapshot>("CartSnapshots");
        }

        public async Task<CartSnapshot?> GetByCartIdAsync(
            string cartId,
            CancellationToken cancellationToken = default)
        {
            return await _collection
                .Find(x => x.CartId == cartId)
                .FirstOrDefaultAsync(cancellationToken);
        }

        public async Task<CartSnapshot> UpsertAsync(
    CartSnapshot snapshot,
    CancellationToken cancellationToken = default)
        {
            snapshot.UpdatedAt = DateTime.UtcNow;

            var existing = await _collection
                .Find(x => x.CartId == snapshot.CartId)
                .FirstOrDefaultAsync(cancellationToken);

            if (existing != null)
            {
                snapshot.Id = existing.Id;
            }
            else if (snapshot.Id == Guid.Empty)
            {
                snapshot.Id = Guid.NewGuid();
            }

            await _collection.ReplaceOneAsync(
                x => x.CartId == snapshot.CartId,
                snapshot,
                new ReplaceOptions
                {
                    IsUpsert = true
                },
                cancellationToken
            );

            return snapshot;
        }

        public async Task ClearAsync(
            string cartId,
            CancellationToken cancellationToken = default)
        {
            await _collection.DeleteOneAsync(
                x => x.CartId == cartId,
                cancellationToken
            );
        }
    }
}