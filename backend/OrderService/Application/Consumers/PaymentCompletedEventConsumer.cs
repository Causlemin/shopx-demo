using MassTransit;
using Domain.Interfaces;
using Domain.Events;

namespace Application.Consumers
{
    public class PaymentCompletedEventConsumer : IConsumer<PaymentCompletedEvent>
    {
        private readonly IOrderStatusRepository _orderStatusRepository;
        
        public PaymentCompletedEventConsumer(IOrderStatusRepository orderStatusRepository)
        {
            _orderStatusRepository = orderStatusRepository;
        }
        
        public async Task Consume(ConsumeContext<PaymentCompletedEvent> context)
        {
            // Ödeme tamamlandı → siparişi "Completed" yap (hem Order hem GuestOrder)
            await _orderStatusRepository.UpdateStatusAsync(context.Message.OrderId, "Completed", context.CancellationToken);
        }
    }
}