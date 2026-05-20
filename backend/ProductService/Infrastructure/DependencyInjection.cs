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
                options.DatabaseName = configuration["MongoDB:DatabaseName"] ?? "ProductsDB";
            });
            
            // Repositories
            services.AddScoped<IProductRepository, ProductRepository>();
            
            // MassTransit + RabbitMQ + Consumer
            services.AddMassTransit(x =>
            {
                // Consumer'ı ekle
                x.AddConsumer<OrderCreatedEventConsumer>();
                
                x.UsingRabbitMq((context, cfg) =>
                {
                    var rabbitMqHost = configuration["RabbitMQ:HostName"] ?? "localhost";
                    var rabbitMqUserName = configuration["RabbitMQ:UserName"] ?? "guest";
                    var rabbitMqPassword = configuration["RabbitMQ:Password"] ?? "guest";
                    
                    cfg.Host(rabbitMqHost, "/", h =>
                    {
                        h.Username(rabbitMqUserName);
                        h.Password(rabbitMqPassword);
                    });
                    
                    // ReceiveEndpoint - SAGA consumer için kuyruk
                    cfg.ReceiveEndpoint("product-service-queue", e =>
                    {
                        e.ConfigureConsumer<OrderCreatedEventConsumer>(context);
                        
                        // Retry policy
                        e.UseMessageRetry(retry =>
                        {
                            retry.Interval(3, TimeSpan.FromSeconds(5));
                        });
                    });
                    
                    cfg.ConfigureEndpoints(context);
                });
            });
                        
            return services;
        }
    }
}