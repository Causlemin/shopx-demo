using MediatR;
using Domain.Entities;
using Domain.Interfaces;

namespace Application.Features.Products.Queries
{
    public class GetAllProductsQuery : IRequest<IEnumerable<Product>> { }
    
    public class GetAllProductsQueryHandler : IRequestHandler<GetAllProductsQuery, IEnumerable<Product>>
    {
        private readonly IProductRepository _repository;
        
        public GetAllProductsQueryHandler(IProductRepository repository)
        {
            _repository = repository;
        }
        
        public async Task<IEnumerable<Product>> Handle(GetAllProductsQuery request, CancellationToken cancellationToken)
        {
            return await _repository.GetAllAsync(cancellationToken);
        }
    }
}