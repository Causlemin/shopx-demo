using MediatR;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Queries
{
    public class GetMyOrdersQuery : IRequest<List<Order>>
    {
        public Guid UserId { get; set; }
    }

    public class GetMyOrdersQueryHandler : IRequestHandler<GetMyOrdersQuery, List<Order>>
    {
        private readonly IOrderRepository _orderRepository;
        
        public GetMyOrdersQueryHandler(IOrderRepository orderRepository)
        {
            _orderRepository = orderRepository;
        }
        
        public async Task<List<Order>> Handle(GetMyOrdersQuery request, CancellationToken cancellationToken)
        {
            var orders = await _orderRepository.GetByUserIdAsync(request.UserId, cancellationToken);
            return orders.ToList();
        }
    }
}