using MassTransit;
using Domain.Interfaces;
using Domain.Events;

namespace Application.Consumers
{
    public class StockFailedEventConsumer(IOrderStatusRepository orderRepository) : IConsumer<StockFailedEvent>
    {
        private readonly IOrderStatusRepository _orderRepository = orderRepository;

        public async Task Consume(ConsumeContext<StockFailedEvent> context)
        {
            // SAGA: Stok rezervasyonu başarısız → siparişi iptal et (Compensating Transaction)
            await _orderRepository.UpdateStatusAsync(context.Message.OrderId, "Cancelled", context.CancellationToken);
        }
    }
}