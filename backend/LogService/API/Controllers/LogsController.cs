using Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]

    public class LogsController(ILogRepository logRepository) : ControllerBase
    {
        private readonly ILogRepository _logRepository = logRepository;

        [HttpGet("service/{service}")]
        public async Task<IActionResult> GetByService(string service, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            var logs = await _logRepository.GetByServiceAsync(service, from, to);
            return Ok(logs);
        }

        [HttpGet("correlation/{correlationId}")]
        public async Task<IActionResult> GetByCorrelationId(string correlationId)
        {
            var logs = await _logRepository.GetByCorrelationIdAsync(correlationId);
            return Ok(logs);
        }

        [HttpGet("level/{level}")]
        public async Task<IActionResult> GetByLevel(string level, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            var logs = await _logRepository.GetByLevelAsync(level, from, to);
            return Ok(logs);
        }

        [HttpGet]
        public async Task<IActionResult> GetLatest([FromQuery] int limit = 50, CancellationToken cancellationToken = default)
        {
            var logs = await _logRepository.GetLatestAsync(limit, cancellationToken);
            return Ok(logs);
        }
    }
}