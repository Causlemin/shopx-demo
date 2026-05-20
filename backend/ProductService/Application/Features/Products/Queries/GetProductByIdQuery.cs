using MediatR;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Features.Products.Queries
{
    public class GetProductByIdQuery : IRequest<Product?>
    {
        public Guid Id { get; set; }
    }
    
    public class GetProductByIdQueryHandler : IRequestHandler<GetProductByIdQuery, Product?>
    {
        private readonly IProductRepository _repository;
        
        public GetProductByIdQueryHandler(IProductRepository repository)
        {
            _repository = repository;
        }
        
        public async Task<Product?> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
        {
            return await _repository.GetByIdAsync(request.Id, cancellationToken);
        }
    }
}