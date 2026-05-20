using Domain.Events;
using ApiGateway.Hubs;
using MassTransit;
using Microsoft.AspNetCore.SignalR;

namespace ApiGateway.Consumers
{
    public class OrderCompletedEventConsumer : IConsumer<OrderCompletedEvent>
    {
        private readonly IHubContext<CartHub> _hubContext;

        public OrderCompletedEventConsumer(IHubContext<CartHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task Consume(ConsumeContext<OrderCompletedEvent> context)
        {
            Console.WriteLine($"OrderCompletedEvent received: {context.Message.OrderId}");
            
            await _hubContext.Clients.All.SendAsync(
                "OrderCompleted",
                context.Message,
                context.CancellationToken
            );
        }
    }
}