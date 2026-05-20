using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Application.Commands;
using System.Security.Claims;
using Application.Queries;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly IMediator _mediator;

        public OrdersController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // Logged-in kullanıcı için sipariş oluşturma
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderCommand command)
        {
            var userIdClaim = User.FindFirst("userId") ?? User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized("User ID not found in token");

            command.UserId = Guid.Parse(userIdClaim.Value);

            var order = await _mediator.Send(command);
            return Ok(new { orderId = order.Id, orderNumber = order.OrderNumber, status = order.Status });
        }

        // Misafir kullanıcı için sipariş oluşturma
        [HttpPost("guest")]
        [AllowAnonymous]
        public async Task<IActionResult> CreateGuestOrder([FromBody] CreateOrderCommand command)
        {
            command.UserId = null;

            var order = await _mediator.Send(command);

            return Ok(new
            {
                orderId = order.Id,
                orderNumber = order.OrderNumber,
                trackingNumber = order.TrackingNumber,
                status = order.Status
            });
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetOrder(Guid id)
        {
            var order = await _mediator.Send(new GetOrderQuery { OrderId = id });

            if (order == null)
                return NotFound("Order not found");

            if (order.UserId == null)
                return Ok(order);

            var userIdClaim =
                User.FindFirst("userId") ??
                User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
                return Unauthorized("User ID not found in token");

            if (!Guid.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized("Invalid user ID in token");

            if (userId != order.UserId)
                return Unauthorized("You can only view your own orders");

            return Ok(order);
        }
        
        [HttpGet("my")]
        [Authorize]
        public async Task<IActionResult> GetMyOrders()
        {
            var userIdClaim = User.FindFirst("userId") ?? User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                return Unauthorized();

            var userId = Guid.Parse(userIdClaim.Value);
            var orders = await _mediator.Send(new GetMyOrdersQuery { UserId = userId });
            return Ok(orders);
        }
    }
}