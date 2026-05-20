using Domain.Entities;
using Domain.Interfaces;
using Domain.Events;
using MassTransit;

namespace Application.Consumers
{
    public class UserRegisteredEventConsumer : IConsumer<UserRegisteredEvent>
    {
        private readonly ILogRepository _logRepository;
        
        public UserRegisteredEventConsumer(ILogRepository logRepository)
        {
            _logRepository = logRepository;
        }
        
        public async Task Consume(ConsumeContext<UserRegisteredEvent> context)
        {
            var logEntry = new LogEntry
            {
                Timestamp = DateTime.UtcNow,
                Level = "Information",
                Message = $"New user registered: {context.Message.Username} (Email: {context.Message.Email})",
                Service = "AuthService",
                CorrelationId = context.Message.CorrelationId,
                UserId = context.Message.UserId.ToString(),
                AdditionalData = new Dictionary<string, object>
                {
                    { "UserId", context.Message.UserId.ToString() },
                    { "Username", context.Message.Username },
                    { "Email", context.Message.Email },
                    { "Roles", string.Join(", ", context.Message.Roles) }
                }
            };
            
            await _logRepository.CreateAsync(logEntry, context.CancellationToken);
        }
    }
}