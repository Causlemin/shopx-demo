namespace Domain.Events
{
    public class UserRegisteredEvent
    {
        public Guid UserId { get; set; }
        public string Email { get; set; } = null!;
        public string Username { get; set; } = null!;
        public List<string> Roles { get; set; } = new();
        public DateTime OccurredAt { get; set; }
        public string CorrelationId { get; set; } = Guid.NewGuid().ToString();
    }
}