namespace Domain.Events
{
    public class PaymentCompletedEvent
    {
        public Guid OrderId { get; set; }
        public string OrderNumber { get; set; } = null!;
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = null!;
        public string CorrelationId { get; set; } = null!;
        public DateTime OccurredAt { get; set; }
    }
}