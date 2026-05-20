using MediatR;
using Domain.Entities;
using Domain.Interfaces;
using Domain.Events;
using MassTransit;

namespace Application.Commands
{
    public class CreateOrderCommand : IRequest<Order>
    {
        public Guid? UserId { get; set; }
        
        // Çoklu ürün desteği
        public List<OrderItemInput> Items { get; set; } = new();
        public decimal TotalPrice { get; set; }
        
        // Ödeme Bilgileri
        public string PaymentMethod { get; set; } = "credit_card";
        public string CardNumber { get; set; } = null!;
        public string CardName { get; set; } = null!;
        public string ExpiryDate { get; set; } = null!;
        
        // Adres Bilgileri
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string City { get; set; } = null!;
        public string District { get; set; } = null!;
        public string Address { get; set; } = null!;
        public string? ZipCode { get; set; }
        public string? Notes { get; set; }
    }
    
    public class OrderItemInput
    {
        public Guid ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }

    public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, Order>
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IPublishEndpoint _publishEndpoint;

        public CreateOrderCommandHandler(IOrderRepository orderRepository, IPublishEndpoint publishEndpoint)
        {
            _orderRepository = orderRepository;
            _publishEndpoint = publishEndpoint;
        }

        public async Task<Order> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
        {
            var orderNumber = GenerateOrderNumber();
            var correlationId = Guid.NewGuid().ToString();
            
            // Order entity'si için ilk ürünü ana ürün olarak kaydediyoruz (ancak tüm ürünler Items içinde)
            var firstItem = request.Items.First();
            
            var order = new Order
            {
                OrderNumber = orderNumber,
                UserId = request.UserId,
                TrackingNumber = request.UserId == null
                    ? GenerateTrackingNumber()
                    : null,

                IsGuest = request.UserId == null,
                ProductId = firstItem.ProductId,
                ProductName = firstItem.ProductName,
                Quantity = firstItem.Quantity,
                TotalPrice = request.TotalPrice,
                
                // Ödeme Bilgileri
                PaymentMethod = request.PaymentMethod,
                CardNumber = request.CardNumber,
                CardName = request.CardName,
                ExpiryDate = request.ExpiryDate,
                PaymentStatus = "pending",
                
                // Adres Bilgileri
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                Phone = request.Phone,
                City = request.City,
                District = request.District,
                Address = request.Address,
                ZipCode = request.ZipCode,
                Notes = request.Notes,
                
                Status = "Pending",
                CorrelationId = correlationId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            await _orderRepository.CreateAsync(order, cancellationToken);
            
            // Items listesini OrderItemEvent'e dönüştür
            var itemsEvent = request.Items.Select(i => new OrderItemEvent
            {
                ProductId = i.ProductId,
                ProductName = i.ProductName,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice
            }).ToList();

            await _publishEndpoint.Publish(new OrderCreatedEvent
            {
                OrderId = order.Id,
                OrderNumber = orderNumber,
                UserId = request.UserId,
                TrackingNumber = order.TrackingNumber,
                IsGuest = order.IsGuest,
                
                Items = itemsEvent,
                TotalPrice = request.TotalPrice,
                
                PaymentMethod = request.PaymentMethod,
                CardNumber = request.CardNumber,
                CardName = request.CardName,
                ExpiryDate = request.ExpiryDate,
                
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                Phone = request.Phone,
                City = request.City,
                District = request.District,
                Address = request.Address,
                ZipCode = request.ZipCode,
                Notes = request.Notes,
                
                CorrelationId = correlationId,
                OccurredAt = DateTime.UtcNow
            }, cancellationToken);

            return order;
        }
        
        private string GenerateOrderNumber()
        {
            return $"ORD-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";
        }

        private string GenerateTrackingNumber()
        {
            return $"TRK-{DateTime.Now:yyyyMMddHHmmss}-{new Random().Next(1000, 9999)}";
        }
    }
}