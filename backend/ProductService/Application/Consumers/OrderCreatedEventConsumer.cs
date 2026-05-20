using MassTransit;
using Domain.Interfaces;
using Domain.Events;
using OrderCreatedEvent = Domain.Events.OrderCreatedEvent;

namespace Application.Consumers
{
    public class OrderCreatedEventConsumer : IConsumer<OrderCreatedEvent>
    {
        private readonly IProductRepository _productRepository;
        private readonly IPublishEndpoint _publishEndpoint;
        
        public OrderCreatedEventConsumer(IProductRepository productRepository, IPublishEndpoint publishEndpoint)
        {
            _productRepository = productRepository;
            _publishEndpoint = publishEndpoint;
        }

        public async Task Consume(ConsumeContext<OrderCreatedEvent> context)
        {
            bool allSuccessful = true;
            
            foreach (var item in context.Message.Items)
            {
                var product = await _productRepository.GetByIdAsync(item.ProductId, context.CancellationToken);
                
                if (product == null || product.Stock < item.Quantity)
                {
                    allSuccessful = false;
                    break;
                }
            }
            
            if (!allSuccessful)
            {
                await _publishEndpoint.Publish(new StockFailedEvent
                {
                    OrderId = context.Message.OrderId,
                    OrderNumber = context.Message.OrderNumber,
                    ProductId = context.Message.Items.First().ProductId,
                    Reason = "Insufficient stock for one or more products",
                    CorrelationId = context.Message.CorrelationId,
                    OccurredAt = DateTime.UtcNow
                }, context.CancellationToken);
                return;
            }
            
            foreach (var item in context.Message.Items)
            {
                await _productRepository.UpdateStockAsync(item.ProductId, item.Quantity, context.CancellationToken);
            }
            
            await _publishEndpoint.Publish(new StockReservedEvent
            {
                OrderId = context.Message.OrderId,
                OrderNumber = context.Message.OrderNumber,
                ProductId = context.Message.Items.First().ProductId,
                Quantity = context.Message.Items.Sum(x => x.Quantity),
                CorrelationId = context.Message.CorrelationId,
                OccurredAt = DateTime.UtcNow
            }, context.CancellationToken);
        }
    }
}