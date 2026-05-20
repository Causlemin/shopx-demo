namespace Domain.Events
{
    public class OrderCreatedEvent
    {
        public Guid OrderId { get; set; }
        public string OrderNumber { get; set; } = null!;
        public string? TrackingNumber { get; set; }
        public bool IsGuest { get; set; }
        public Guid? UserId { get; set; }
        
        // Çoklu ürün desteği
        public List<OrderItemEvent> Items { get; set; } = new();
        public decimal TotalPrice { get; set; }
        
        // Ödeme Bilgileri
        public string PaymentMethod { get; set; } = "credit_card";
        public string CardNumber { get; set; } = null!;
        public string CardName { get; set; } = null!;
        public string ExpiryDate { get; set; } = null!;
        
        // Adres Bilgileri
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string City { get; set; } = null!;
        public string District { get; set; } = null!;
        public string Address { get; set; } = null!;
        public string? ZipCode { get; set; }
        public string? Notes { get; set; }
        
        public string CorrelationId { get; set; } = null!;
        public DateTime OccurredAt { get; set; }
    }
    
    public class OrderItemEvent
    {
        public Guid ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}