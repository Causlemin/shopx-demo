using Domain.Entities;

namespace Domain.Interfaces
{
    public interface ILogRepository
    {
        Task CreateAsync(LogEntry logEntry, CancellationToken cancellationToken = default);
        Task<IEnumerable<LogEntry>> GetByServiceAsync(string service, DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default);
        Task<IEnumerable<LogEntry>> GetByLevelAsync(string level, DateTime? from = null, DateTime? to = null, CancellationToken cancellationToken = default);
        Task<IEnumerable<LogEntry>> GetByCorrelationIdAsync(string correlationId, CancellationToken cancellationToken = default);
        Task<IEnumerable<LogEntry>> GetLatestAsync(int limit, CancellationToken cancellationToken = default);
    }
}