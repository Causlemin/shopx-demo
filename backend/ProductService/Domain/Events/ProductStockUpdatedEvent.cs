namespace Domain.Events
{
    public class ProductStockUpdatedEvent
    {
        public Guid ProductId { get; set; }
        public string Name { get; set; } = null!;
        public int RemainingStock { get; set; }
        public int QuantityChanged { get; set; }
        public DateTime OccurredAt { get; set; }
        public string CorrelationId { get; set; } = Guid.NewGuid().ToString();
    }
}