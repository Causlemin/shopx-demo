using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Domain.Entities
{
    public class Product
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [BsonElement("name")]
        public string Name { get; set; } = null!;
        
        [BsonElement("description")]
        public string Description { get; set; } = null!;
        
        [BsonElement("price")]
        public decimal Price { get; set; }
        
        [BsonElement("stock")]
        public int Stock { get; set; }
        
        [BsonElement("category")]
        public string Category { get; set; } = null!;
        
        [BsonElement("imageUrl")]
        public string? ImageUrl { get; set; }
        
        [BsonElement("isActive")]
        public bool IsActive { get; set; } = true;
        
        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}