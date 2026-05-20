using MediatR;
using Domain.Entities;
using Domain.Interfaces;
using MassTransit;
using Domain.Events;

namespace Application.Features.Products.Commands
{
    public class CreateProductCommand : IRequest<Product>
    {
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public string Category { get; set; } = null!;
        public string? ImageUrl { get; set; }
    }
    
    public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, Product>
    {
        private readonly IProductRepository _repository;
        private readonly IPublishEndpoint _publishEndpoint;
        
        public CreateProductCommandHandler(IProductRepository repository, IPublishEndpoint publishEndpoint)
        {
            _repository = repository;
            _publishEndpoint = publishEndpoint;
        }
        
        public async Task<Product> Handle(CreateProductCommand request, CancellationToken cancellationToken)
        {
            var product = new Product
            {
                Name = request.Name,
                Description = request.Description,
                Price = request.Price,
                Stock = request.Stock,
                Category = request.Category,
                ImageUrl = request.ImageUrl,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            await _repository.CreateAsync(product, cancellationToken);
            
            // Event fırlat
            await _publishEndpoint.Publish(new ProductCreatedEvent
            {
                ProductId = product.Id,
                Name = product.Name,
                Price = product.Price,
                Category = product.Category,
                Stock = product.Stock,
                OccurredAt = DateTime.UtcNow
            }, cancellationToken);
            
            return product;
        }
    }
}