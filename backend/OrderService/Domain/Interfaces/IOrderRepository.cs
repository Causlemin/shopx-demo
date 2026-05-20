using Domain.Entities;

namespace Domain.Interfaces
{
    public interface IOrderRepository
    {
        Task<Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<Order?> GetByOrderNumberAsync(string orderNumber, CancellationToken cancellationToken = default);
        Task<IEnumerable<Order>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
        Task CreateAsync(Order order, CancellationToken cancellationToken = default);
        Task UpdateStatusAsync(Guid id, string status, CancellationToken cancellationToken = default);
        Task UpdatePaymentStatusAsync(Guid id, string paymentStatus, CancellationToken cancellationToken = default);
    }
}