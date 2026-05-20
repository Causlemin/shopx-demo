using Domain.Interfaces;
using Infrastructure.Repositories;
using Infrastructure.Services;
using Infrastructure.Settings;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using MassTransit;

namespace Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            // MongoDB Settings
            services.Configure<MongoDbSettings>(options =>
            {
                options.ConnectionString = configuration["MongoDB:ConnectionString"] ?? throw new InvalidOperationException("MongoDB connection string is missing");
                options.DatabaseName = configuration["MongoDB:DatabaseName"] ?? "AuthDB";
            });
            
            // Repositories
            services.AddScoped<IUserRepository, UserRepository>();
            
            // Services
            services.AddScoped<IPasswordHasher, PasswordHasher>();
            services.AddScoped<ITokenService, TokenService>();
            
            // MassTransit + RabbitMQ
            services.AddMassTransit(x =>
            {
                x.UsingRabbitMq((context, cfg) =>
                {
                    cfg.Host(configuration["RabbitMQ:HostName"] ?? "localhost", "/", h =>
                    {
                        h.Username(configuration["RabbitMQ:UserName"] ?? "guest");
                        h.Password(configuration["RabbitMQ:Password"] ?? "guest");
                    });
                    cfg.ConfigureEndpoints(context);
                });
            });
            
            
            // JWT Authentication
            var secretKey = configuration["Jwt:Secret"] ?? throw new InvalidOperationException("JWT Secret is missing");
            var issuer = configuration["Jwt:Issuer"] ?? "auth-service";
            var audience = configuration["Jwt:Audience"] ?? "api-gateway";
            
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = issuer,
                        ValidAudience = audience,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
                    };
                });
            
            return services;
        }
    }
}
