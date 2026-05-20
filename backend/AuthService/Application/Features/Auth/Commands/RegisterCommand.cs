using MediatR;
using Domain.Entities;
using Domain.Interfaces;
using Domain.Events;
using MassTransit;
using System.Text.Json.Serialization;

namespace Application.Features.Auth.Commands
{
    public class RegisterCommand : IRequest<RegisterResponse>
    {
        public string Email { get; set; } = null!;
        public string Username { get; set; } = null!;
        public string Password { get; set; } = null!;
        public List<string>? Roles { get; set; }
    }

    public class RegisterResponse
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }

        [JsonPropertyName("message")]
        public string? Message { get; set; }

        [JsonPropertyName("userId")]
        public Guid? UserId { get; set; }
    }

    public class RegisterCommandHandler(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IPublishEndpoint publishEndpoint) : IRequestHandler<RegisterCommand, RegisterResponse>
    {
        private readonly IUserRepository _userRepository = userRepository;
        private readonly IPasswordHasher _passwordHasher = passwordHasher;
        private readonly IPublishEndpoint _publishEndpoint = publishEndpoint;

        public async Task<RegisterResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
        {
            // Check if user exists
            if (await _userRepository.ExistsByEmailAsync(request.Email, cancellationToken))
            {
                return new RegisterResponse { Success = false, Message = "Email already exists" };
            }

            var existingUser = await _userRepository.GetByUsernameAsync(request.Username, cancellationToken);
            if (existingUser != null)
            {
                return new RegisterResponse { Success = false, Message = "Username already exists" };
            }

            // Hash password
            var passwordHash = _passwordHasher.HashPassword(request.Password, out string salt);

            // Create user
            var user = new User
            {
                Email = request.Email.ToLowerInvariant(),
                Username = request.Username.ToLowerInvariant(),
                PasswordHash = passwordHash,
                Salt = salt,
                Roles = request.Roles ?? new List<string> { "User" },
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _userRepository.CreateAsync(user, cancellationToken);

            // Fire UserRegisteredEvent
            await _publishEndpoint.Publish(new UserRegisteredEvent
            {
                UserId = user.Id,
                Email = user.Email,
                Username = user.Username,
                Roles = user.Roles,
                OccurredAt = DateTime.UtcNow
            }, cancellationToken);

            return new RegisterResponse
            {
                Success = true,
                Message = "User registered successfully",
                UserId = user.Id
            };
        }
    }
}