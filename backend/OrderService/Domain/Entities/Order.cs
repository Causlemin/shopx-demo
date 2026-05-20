using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Domain.Entities
{
    public class Order
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public Guid Id { get; set; } = Guid.NewGuid();

        [BsonElement("orderNumber")]
        public string OrderNumber { get; set; } = null!;
        
        [BsonElement("trackingNumber")]
        public string? TrackingNumber { get; set; }

        [BsonElement("isGuest")]
        public bool IsGuest { get; set; }

        [BsonElement("userId")]
        public Guid? UserId { get; set; }

        // Ana ürün bilgileri (ilk ürün - hızlı görüntüleme için)
        [BsonElement("productId")]
        public Guid ProductId { get; set; }

        [BsonElement("productName")]
        public string? ProductName { get; set; } = null;

        [BsonElement("quantity")]
        public int Quantity { get; set; }

        [BsonElement("totalPrice")]
        public decimal TotalPrice { get; set; }
        
        // Çoklu ürün desteği (tüm ürünler)
        [BsonElement("items")]
        public List<OrderItemEntity> Items { get; set; } = new();

        // Ödeme Bilgileri
        [BsonElement("paymentMethod")]
        public string PaymentMethod { get; set; } = "credit_card";

        [BsonElement("cardNumber")]
        public string? CardNumber { get; set; }

        [BsonElement("cardName")]
        public string? CardName { get; set; }

        [BsonElement("expiryDate")]
        public string? ExpiryDate { get; set; }

        [BsonElement("paymentStatus")]
        public string PaymentStatus { get; set; } = "pending";

        // Adres Bilgileri
        [BsonElement("firstName")]
        public string? FirstName { get; set; }

        [BsonElement("lastName")]
        public string? LastName { get; set; }

        [BsonElement("email")]
        public string? Email { get; set; }

        [BsonElement("phone")]
        public string? Phone { get; set; }

        [BsonElement("city")]
        public string? City { get; set; }

        [BsonElement("district")]
        public string? District { get; set; }

        [BsonElement("address")]
        public string? Address { get; set; }

        [BsonElement("zipCode")]
        public string? ZipCode { get; set; }

        [BsonElement("notes")]
        public string? Notes { get; set; }

        [BsonElement("status")]
        public string Status { get; set; } = "Pending";

        [BsonElement("correlationId")]
        public string CorrelationId { get; set; } = Guid.NewGuid().ToString();

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
    
    public class OrderItemEntity
    {
        [BsonElement("productId")]
        public Guid ProductId { get; set; }
        
        [BsonElement("productName")]
        public string ProductName { get; set; } = null!;
        
        [BsonElement("quantity")]
        public int Quantity { get; set; }
        
        [BsonElement("unitPrice")]
        public decimal UnitPrice { get; set; }
        
        [BsonElement("totalPrice")]
        public decimal TotalPrice { get; set; }
    }
}