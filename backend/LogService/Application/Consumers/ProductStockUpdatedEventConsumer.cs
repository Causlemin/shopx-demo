using Domain.Entities;
using Domain.Interfaces;
using MassTransit;
using ProductStockUpdatedEvent = Domain.Events.ProductStockUpdatedEvent;

namespace Application.Consumers
{
    public class ProductStockUpdatedEventConsumer : IConsumer<ProductStockUpdatedEvent>
    {
        private readonly ILogRepository _logRepository;
        
        public ProductStockUpdatedEventConsumer(ILogRepository logRepository)
        {
            _logRepository = logRepository;
        }
        
        public async Task Consume(ConsumeContext<ProductStockUpdatedEvent> context)
        {
            var logEntry = new LogEntry
            {
                Timestamp = DateTime.UtcNow,
                Level = "Information",
                Message = $"Product stock updated: {context.Message.Name} - Remaining: {context.Message.RemainingStock}",
                Service = "ProductService",
                CorrelationId = context.Message.CorrelationId,
                AdditionalData = new Dictionary<string, object>
                {
                    { "ProductId", context.Message.ProductId },
                    { "ProductName", context.Message.Name },
                    { "RemainingStock", context.Message.RemainingStock },
                    { "QuantityChanged", context.Message.QuantityChanged }
                }
            };
            
            await _logRepository.CreateAsync(logEntry, context.CancellationToken);
        }
    }
}