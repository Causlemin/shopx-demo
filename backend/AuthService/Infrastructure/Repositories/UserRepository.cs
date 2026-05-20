using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Settings;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly IMongoCollection<User> _users;
        
        public UserRepository(IOptions<MongoDbSettings> settings)
        {
            var mongoClient = new MongoClient(settings.Value.ConnectionString);
            var database = mongoClient.GetDatabase(settings.Value.DatabaseName);
            _users = database.GetCollection<User>("Users");
            
            // Indexes
            var emailIndex = new CreateIndexModel<User>(
                Builders<User>.IndexKeys.Ascending(u => u.Email),
                new CreateIndexOptions { Unique = true }
            );
            _users.Indexes.CreateOne(emailIndex);
            
            var usernameIndex = new CreateIndexModel<User>(
                Builders<User>.IndexKeys.Ascending(u => u.Username),
                new CreateIndexOptions { Unique = true }
            );
            _users.Indexes.CreateOne(usernameIndex);
        }
        
        public async Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _users.Find(u => u.Id == id).FirstOrDefaultAsync(cancellationToken);
        }
        
        public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
        {
            return await _users.Find(u => u.Email == email.ToLowerInvariant()).FirstOrDefaultAsync(cancellationToken);
        }
        
        public async Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default)
        {
            return await _users.Find(u => u.Username == username.ToLowerInvariant()).FirstOrDefaultAsync(cancellationToken);
        }
        
        public async Task<User?> GetByRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
        {
            return await _users.Find(u => u.RefreshToken == refreshToken).FirstOrDefaultAsync(cancellationToken);
        }
        
        public async Task<IEnumerable<User>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _users.Find(_ => true).ToListAsync(cancellationToken);
        }
        
        public async Task CreateAsync(User user, CancellationToken cancellationToken = default)
        {
            await _users.InsertOneAsync(user, cancellationToken: cancellationToken);
        }
        
        public async Task UpdateAsync(User user, CancellationToken cancellationToken = default)
        {
            user.UpdatedAt = DateTime.UtcNow;
            await _users.ReplaceOneAsync(u => u.Id == user.Id, user, cancellationToken: cancellationToken);
        }
        
        public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
        {
            await _users.DeleteOneAsync(u => u.Id == id, cancellationToken);
        }
        
        public async Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default)
        {
            return await _users.Find(u => u.Email == email.ToLowerInvariant()).AnyAsync(cancellationToken);
        }
    }
}