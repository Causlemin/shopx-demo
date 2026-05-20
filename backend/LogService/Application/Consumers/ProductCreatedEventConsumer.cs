using Domain.Entities;
using Domain.Interfaces;
using MassTransit;
using ProductCreatedEvent = Domain.Events.ProductCreatedEvent;

namespace Application.Consumers
{
    public class ProductCreatedEventConsumer : IConsumer<ProductCreatedEvent>
    {
        private readonly ILogRepository _logRepository;
        
        public ProductCreatedEventConsumer(ILogRepository logRepository)
        {
            _logRepository = logRepository;
        }
        
        public async Task Consume(ConsumeContext<ProductCreatedEvent> context)
        {
            var logEntry = new LogEntry
            {
                Timestamp = DateTime.UtcNow,
                Level = "Information",
                Message = $"Product created: {context.Message.Name} (ID: {context.Message.ProductId})",
                Service = "ProductService",
                CorrelationId = context.Message.CorrelationId,
                AdditionalData = new Dictionary<string, object>
                {
                    { "ProductId", context.Message.ProductId },
                    { "ProductName", context.Message.Name },
                    { "Price", context.Message.Price },
                    { "Category", context.Message.Category },
                    { "Stock", context.Message.Stock }
                }
            };
            
            await _logRepository.CreateAsync(logEntry, context.CancellationToken);
        }
    }
}