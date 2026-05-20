namespace Domain.Events
{
    public class ProductCreatedEvent
    {
        public Guid ProductId { get; set; }
        public string Name { get; set; } = null!;
        public decimal Price { get; set; }
        public string Category { get; set; } = null!;
        public int Stock { get; set; }
        public DateTime OccurredAt { get; set; }
        public string CorrelationId { get; set; } = Guid.NewGuid().ToString();
    }
}