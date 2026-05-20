namespace Domain.Interfaces
{
    public interface IOrderStatusRepository
    {
        Task UpdateStatusAsync(Guid orderId, string status, CancellationToken cancellationToken = default);
    }
}