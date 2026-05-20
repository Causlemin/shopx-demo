namespace Domain.Events
{
    public class StockReservedEvent
    {
        public Guid OrderId { get; set; }
        public string OrderNumber { get; set; } = null!;
        public Guid ProductId { get; set; }
        public int Quantity { get; set; }
        public string CorrelationId { get; set; } = null!;
        public DateTime OccurredAt { get; set; }
    }
}