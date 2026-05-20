namespace Domain.Events
{
    public class OrderCompletedEvent
    {
        public Guid OrderId { get; set; }
        public string OrderNumber { get; set; } = null!;
        public string CorrelationId { get; set; } = null!;
        public DateTime OccurredAt { get; set; }
    }
}