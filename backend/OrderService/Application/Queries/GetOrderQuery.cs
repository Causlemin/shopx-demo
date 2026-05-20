using MediatR;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Queries
{
    public class GetOrderQuery : IRequest<Order?>
    {
        public Guid OrderId { get; set; }
    }

    public class GetOrderQueryHandler : IRequestHandler<GetOrderQuery, Order?>
    {
        private readonly IOrderRepository _orderRepository;
        
        public GetOrderQueryHandler(IOrderRepository orderRepository)
        {
            _orderRepository = orderRepository;
        }
        
        public async Task<Order?> Handle(GetOrderQuery request, CancellationToken cancellationToken)
        {
            return await _orderRepository.GetByIdAsync(request.OrderId, cancellationToken);
        }
    }
}