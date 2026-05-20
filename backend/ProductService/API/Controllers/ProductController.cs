using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Application.Features.Products.Commands;
using Application.Features.Products.Queries;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProductsController : ControllerBase
    {
        private readonly IMediator _mediator;
        
        public ProductsController(IMediator mediator)
        {
            _mediator = mediator;
        }
        
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var query = new GetAllProductsQuery();
            var products = await _mediator.Send(query);
            return Ok(products);
        }
        
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(Guid id)
        {
            var query = new GetProductByIdQuery { Id = id };
            var product = await _mediator.Send(query);
            
            if (product == null)
                return NotFound();
                
            return Ok(product);
        }
        
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateProductCommand command)
        {
            var product = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
        }
        
        [HttpPut("{id}/stock")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStock(Guid id, [FromBody] UpdateStockRequest request)
        {
            var command = new UpdateProductStockCommand
            {
                ProductId = id,
                Quantity = request.Quantity
            };
            
            var result = await _mediator.Send(command);
            
            if (!result)
                return BadRequest("Insufficient stock or product not found");
                
            return Ok(new { message = "Stock updated successfully" });
        }
    }
    
    public class UpdateStockRequest
    {
        public int Quantity { get; set; }
    }
}