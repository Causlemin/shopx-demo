using Application; 
using Infrastructure;
using Serilog;
using System.Text.Json;
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
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add Application Layer (MediatR)
builder.Services.AddApplication();

// Add Infrastructure Layer (MongoDB, Repositories, JWT, PasswordHasher)
builder.Services.AddInfrastructure(builder.Configuration);

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