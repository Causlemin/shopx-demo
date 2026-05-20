using MediatR;
using Domain.Interfaces;
using MassTransit;
using Domain.Events;

namespace Application.Features.Products.Commands
{
    public class UpdateProductStockCommand : IRequest<bool>
    {
        public Guid ProductId { get; set; }
        public int Quantity { get; set; }
    }
    
    public class UpdateProductStockCommandHandler : IRequestHandler<UpdateProductStockCommand, bool>
    {
        private readonly IProductRepository _repository;
        private readonly IPublishEndpoint _publishEndpoint;
        
        public UpdateProductStockCommandHandler(IProductRepository repository, IPublishEndpoint publishEndpoint)
        {
            _repository = repository;
            _publishEndpoint = publishEndpoint;
        }
        
        public async Task<bool> Handle(UpdateProductStockCommand request, CancellationToken cancellationToken)
        {
            var product = await _repository.GetByIdAsync(request.ProductId, cancellationToken);
            if (product == null || product.Stock < request.Quantity)
                return false;
            
            await _repository.UpdateStockAsync(request.ProductId, request.Quantity, cancellationToken);
            
            await _publishEndpoint.Publish(new ProductStockUpdatedEvent
            {
                ProductId = product.Id,
                Name = product.Name,
                RemainingStock = product.Stock - request.Quantity,
                QuantityChanged = request.Quantity,
                OccurredAt = DateTime.UtcNow
            }, cancellationToken);
            
            return true;
        }
    }
}