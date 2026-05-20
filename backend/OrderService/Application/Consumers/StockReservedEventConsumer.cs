using MassTransit;
using Domain.Interfaces;
using Domain.Events;

namespace Application.Consumers
{
    public class StockReservedEventConsumer : IConsumer<StockReservedEvent>
    {
        private readonly IOrderStatusRepository _orderStatusRepository;
        private readonly IPublishEndpoint _publishEndpoint;
        
        public StockReservedEventConsumer(IOrderStatusRepository orderStatusRepository, IPublishEndpoint publishEndpoint)
        {
            _orderStatusRepository = orderStatusRepository;
            _publishEndpoint = publishEndpoint;
        }
        
        public async Task Consume(ConsumeContext<StockReservedEvent> context)
        {
            // Stok başarılı → siparişi "Confirmed" yap
            await _orderStatusRepository.UpdateStatusAsync(context.Message.OrderId, "Confirmed", context.CancellationToken);
            
            // Ödeme işlemini tetikle (fake - her zaman başarılı)
            await _publishEndpoint.Publish(new PaymentCompletedEvent
            {
                OrderId = context.Message.OrderId,
                OrderNumber = context.Message.OrderNumber,
                Amount = 0,
                PaymentMethod = "credit_card",
                CorrelationId = context.Message.CorrelationId,
                OccurredAt = DateTime.UtcNow
            }, context.CancellationToken);
        }
    }
}