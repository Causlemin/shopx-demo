using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Domain.Entities
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [BsonElement("email")]
        public string Email { get; set; } = null!;
        
        [BsonElement("username")]
        public string Username { get; set; } = null!;
        
        [BsonElement("passwordHash")]
        public string PasswordHash { get; set; } = null!;
        
        [BsonElement("salt")]
        public string Salt { get; set; } = null!;
        
        [BsonElement("roles")]
        public List<string> Roles { get; set; } = new();
        
        [BsonElement("refreshToken")]
        public string? RefreshToken { get; set; }
        
        [BsonElement("refreshTokenExpiryTime")]
        public DateTime? RefreshTokenExpiryTime { get; set; }
        
        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}