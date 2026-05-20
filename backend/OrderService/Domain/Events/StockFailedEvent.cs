namespace Domain.Events
{
    public class StockFailedEvent
    {
        public Guid OrderId { get; set;}
        public Guid ProductId { get; set; }
        public string? Reason { get; set; } = null;
        public string? CorrelationId { get; set; } = null;
        public DateTime OccuredAt { get; set; }
    }
}