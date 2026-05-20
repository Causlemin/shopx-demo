using Domain.Entities;

namespace Domain.Interfaces
{
    public interface ICartSnapshotRepository
    {
        Task<CartSnapshot?> GetByCartIdAsync(string cartId, CancellationToken cancellationToken = default);
        Task<CartSnapshot> UpsertAsync(CartSnapshot snapshot, CancellationToken cancellationToken = default);
        Task ClearAsync(string cartId, CancellationToken cancellationToken = default);
    }
}