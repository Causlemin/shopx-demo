using MongoDB.Bson.Serialization.Attributes;

namespace Domain.Entities
{
    public class LogEntry
    {
        public string Id { get; set; } = null!;
        public DateTime Timestamp { get; set; }

        public string? Level { get; set; }
        public string? MessageTemplate { get; set; }
        public string? RenderedMessage { get; set; }
        public string? Message { get; set; }
        public string? Exception { get; set; }

        public string? Service { get; set; }
        public string? CorrelationId { get; set; }
        public string? UserId { get; set; }

        public Dictionary<string, object?>? Properties { get; set; }
        public Dictionary<string, object?>? AdditionalData { get; set; }
    }
}