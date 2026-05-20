using MediatR;
using Domain.Interfaces;
using System.Text.Json.Serialization;

namespace Application.Features.Auth.Commands
{
    public class RefreshTokenCommand : IRequest<RefreshTokenResponse>
    {
        public string RefreshToken { get; set; } = null!;
    }
    
    public class RefreshTokenResponse
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }
        [JsonPropertyName("message")]
        public string? Message { get; set; }
        [JsonPropertyName("accessToken")]
        public string? AccessToken { get; set; }
        [JsonPropertyName("refreshToken")]
        public string? RefreshToken { get; set; }
        [JsonPropertyName("expiresAt")]
        public DateTime? ExpiresAt { get; set; }
    }
    
    public class RefreshTokenCommandHandler(IUserRepository userRepository, ITokenService tokenService) : IRequestHandler<RefreshTokenCommand, RefreshTokenResponse>
    {
        private readonly IUserRepository _userRepository = userRepository;
        private readonly ITokenService _tokenService = tokenService;

        public async Task<RefreshTokenResponse> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
        {
            var user = await _userRepository.GetByRefreshTokenAsync(request.RefreshToken, cancellationToken);
            
            if (user == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                return new RefreshTokenResponse { Success = false, Message = "Invalid or expired refresh token" };
            }
            
            var newAccessToken = _tokenService.GenerateAccessToken(user);
            var newRefreshToken = _tokenService.GenerateRefreshToken();
            
            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            await _userRepository.UpdateAsync(user, cancellationToken);
            
            return new RefreshTokenResponse
            {
                Success = true,
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                Message = "Token refreshed successfully",
                ExpiresAt = DateTime.UtcNow.AddMinutes(15)
            };
        }
    }
}