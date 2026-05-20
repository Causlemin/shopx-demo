using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Application;
using Infrastructure;
using Serilog;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;

var builder = WebApplication.CreateBuilder(args);

// MongoDB için Guid Serializer kaydı
BsonSerializer.RegisterSerializer(new GuidSerializer(GuidRepresentation.Standard));

var mongoConnectionString = builder.Configuration["MongoDB:ConnectionString"];
if (string.IsNullOrEmpty(mongoConnectionString))
{
    throw new InvalidOperationException("MongoDB connection string is not configured");
}

// Serilog Ayarları
var logsConnectionString = builder.Configuration["LogsDB:ConnectionString"] ?? 
    throw new InvalidOperationException("LogsDB connection string is missing");

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.MongoDB(logsConnectionString, collectionName: "Logs")
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add Application Layer (MediatR)
builder.Services.AddApplication();

// Add Infrastructure Layer (MongoDB, Repositories, MassTransit)
builder.Services.AddInfrastructure(builder.Configuration);

// JWT Authentication
var secretKey = builder.Configuration["Jwt:Secret"] ?? throw new InvalidOperationException("JWT Secret is missing");
var issuer = builder.Configuration["Jwt:Issuer"] ?? "auth-service";
var audience = builder.Configuration["Jwt:Audience"] ?? "api-gateway";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
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
        
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();
                if (!string.IsNullOrEmpty(token))
                {
                    context.Token = token;
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Configure HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseSerilogRequestLogging();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();