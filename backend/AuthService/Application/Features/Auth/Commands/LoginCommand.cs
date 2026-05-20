using MediatR;
using Domain.Interfaces;
using System.Text.Json.Serialization;

namespace Application.Features.Auth.Commands
{
    public class LoginCommand : IRequest<LoginResponse>
    {
        public string EmailOrUsername { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
    
    public class LoginResponse
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
        [JsonPropertyName("user")]
        public UserDto? User { get; set; }
    }
    
    public class UserDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = null!;
        public string Username { get; set; } = null!;
        public List<string> Roles { get; set; } = new();
    }
    
    public class LoginCommandHandler(IUserRepository userRepository, IPasswordHasher passwordHasher, ITokenService tokenService) : IRequestHandler<LoginCommand, LoginResponse>
    {
        private readonly IUserRepository _userRepository = userRepository;
        private readonly IPasswordHasher _passwordHasher = passwordHasher;
        private readonly ITokenService _tokenService = tokenService;

        public async Task<LoginResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            // Find user by email or username
            var user = await _userRepository.GetByEmailAsync(request.EmailOrUsername, cancellationToken);
            user ??= await _userRepository.GetByUsernameAsync(request.EmailOrUsername, cancellationToken);
            
            if (user == null)
            {
                return new LoginResponse { Success = false, Message = "Invalid credentials" };
            }
            
            // Verify password
            if (!_passwordHasher.VerifyPassword(request.Password, user.PasswordHash, user.Salt))
            {
                return new LoginResponse { Success = false, Message = "Invalid credentials" };
            }
            
            // Generate tokens
            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken();
            
            // Save refresh token
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            await _userRepository.UpdateAsync(user, cancellationToken);
            
            return new LoginResponse
            {
                Success = true,
                AccessToken = accessToken,
                Message = "Login successful",
                RefreshToken = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddMinutes(15),
                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    Username = user.Username,
                    Roles = user.Roles
                }
            };
        }
    }
}