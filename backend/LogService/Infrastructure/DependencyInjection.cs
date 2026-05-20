using Domain.Interfaces;
using Infrastructure.Repositories;
using Infrastructure.Settings;
using Application.Consumers;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
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
                options.DatabaseName = configuration["MongoDB:DatabaseName"] ?? "LogsDB";
            });
            
            // Repositories
            services.AddScoped<ILogRepository, LogRepository>();
            
            // MassTransit + RabbitMQ + Consumers
            services.AddMassTransit(x =>
            {
                x.AddConsumer<ProductCreatedEventConsumer>();
                x.AddConsumer<ProductStockUpdatedEventConsumer>();
                x.AddConsumer<UserRegisteredEventConsumer>();
                
                x.UsingRabbitMq((context, cfg) =>
                {
                    cfg.Host(configuration["RabbitMQ:HostName"] ?? "localhost", "/", h =>
                    {
                        h.Username(configuration["RabbitMQ:UserName"] ?? "guest");
                        h.Password(configuration["RabbitMQ:Password"] ?? "guest");
                    });
                    
                    cfg.ReceiveEndpoint("log-service-queue", e =>
                    {
                        e.ConfigureConsumer<ProductCreatedEventConsumer>(context);
                        e.ConfigureConsumer<ProductStockUpdatedEventConsumer>(context);
                        e.ConfigureConsumer<UserRegisteredEventConsumer>(context);
                    });
                    
                    cfg.ConfigureEndpoints(context);
                });
            });
                        
            return services;
        }
    }
}