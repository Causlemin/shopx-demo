using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Settings;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Infrastructure.Repositories
{
    public class LogRepository : ILogRepository
    {
        private readonly IMongoCollection<BsonDocument> _logs;

        public LogRepository(IOptions<MongoDbSettings> settings)
        {
            var mongoClient = new MongoClient(settings.Value.ConnectionString);
            var database = mongoClient.GetDatabase(settings.Value.DatabaseName);

            _logs = database.GetCollection<BsonDocument>("Logs");

            var serviceIndex = new CreateIndexModel<BsonDocument>(
                Builders<BsonDocument>.IndexKeys
                    .Ascending("Service")
                    .Ascending("Properties.Service")
                    .Ascending("Properties.SourceContext")
                    .Descending("Timestamp")
            );

            _logs.Indexes.CreateOne(serviceIndex);

            var timestampIndex = new CreateIndexModel<BsonDocument>(
                Builders<BsonDocument>.IndexKeys.Descending("Timestamp")
            );

            _logs.Indexes.CreateOne(timestampIndex);

            var correlationIdIndex = new CreateIndexModel<BsonDocument>(
                Builders<BsonDocument>.IndexKeys
                    .Ascending("CorrelationId")
                    .Ascending("Properties.CorrelationId")
            );

            _logs.Indexes.CreateOne(correlationIdIndex);

            var levelIndex = new CreateIndexModel<BsonDocument>(
                Builders<BsonDocument>.IndexKeys
                    .Ascending("Level")
                    .Descending("Timestamp")
            );

            _logs.Indexes.CreateOne(levelIndex);
        }

        public async Task CreateAsync(
            LogEntry logEntry,
            CancellationToken cancellationToken = default)
        {
            var document = new BsonDocument
            {
                { "Timestamp", logEntry.Timestamp == default ? DateTime.UtcNow : logEntry.Timestamp },
                { "Level", logEntry.Level ?? "Information" },
                { "Message", logEntry.Message != null ? BsonValue.Create(logEntry.Message) : BsonNull.Value },
                { "MessageTemplate", logEntry.MessageTemplate != null ? BsonValue.Create(logEntry.MessageTemplate) : BsonNull.Value },
                { "RenderedMessage", logEntry.RenderedMessage != null
                    ? BsonValue.Create(logEntry.RenderedMessage)
                    : logEntry.Message != null
                        ? BsonValue.Create(logEntry.Message)
                        : BsonNull.Value
                },
                { "Exception", logEntry.Exception != null ? BsonValue.Create(logEntry.Exception) : BsonNull.Value },
                { "Service", logEntry.Service != null ? BsonValue.Create(logEntry.Service) : BsonNull.Value },
                { "CorrelationId", logEntry.CorrelationId != null ? BsonValue.Create(logEntry.CorrelationId) : BsonNull.Value },
                { "UserId", logEntry.UserId != null ? BsonValue.Create(logEntry.UserId) : BsonNull.Value },
                { "UtcTimestamp", DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ssZ") }
            };

            if (logEntry.Properties != null)
            {
                document["Properties"] = ToBsonDocument(logEntry.Properties);
            }

            if (logEntry.AdditionalData != null)
            {
                document["AdditionalData"] = ToBsonDocument(logEntry.AdditionalData);
            }

            await _logs.InsertOneAsync(document, cancellationToken: cancellationToken);
        }

        public async Task<IEnumerable<LogEntry>> GetLatestAsync(
            int limit,
            CancellationToken cancellationToken = default)
        {
            var documents = await _logs
                .Find(FilterDefinition<BsonDocument>.Empty)
                .Sort(Builders<BsonDocument>.Sort.Descending("Timestamp"))
                .Limit(limit)
                .ToListAsync(cancellationToken);

            return documents.Select(MapToLogEntry);
        }

        public async Task<IEnumerable<LogEntry>> GetByServiceAsync(
            string service,
            DateTime? from = null,
            DateTime? to = null,
            CancellationToken cancellationToken = default)
        {
            var filter = Builders<BsonDocument>.Filter.Or(
                Builders<BsonDocument>.Filter.Eq("Service", service),
                Builders<BsonDocument>.Filter.Eq("Properties.Service", service),
                Builders<BsonDocument>.Filter.Eq("Properties.SourceContext", service)
            );

            filter = ApplyDateFilter(filter, from, to);

            var documents = await _logs
                .Find(filter)
                .Sort(Builders<BsonDocument>.Sort.Descending("Timestamp"))
                .ToListAsync(cancellationToken);

            return documents.Select(MapToLogEntry);
        }

        public async Task<IEnumerable<LogEntry>> GetByLevelAsync(
            string level,
            DateTime? from = null,
            DateTime? to = null,
            CancellationToken cancellationToken = default)
        {
            var filter = Builders<BsonDocument>.Filter.Eq("Level", level);

            filter = ApplyDateFilter(filter, from, to);

            var documents = await _logs
                .Find(filter)
                .Sort(Builders<BsonDocument>.Sort.Descending("Timestamp"))
                .ToListAsync(cancellationToken);

            return documents.Select(MapToLogEntry);
        }

        public async Task<IEnumerable<LogEntry>> GetByCorrelationIdAsync(
            string correlationId,
            CancellationToken cancellationToken = default)
        {
            var filter = Builders<BsonDocument>.Filter.Or(
                Builders<BsonDocument>.Filter.Eq("CorrelationId", correlationId),
                Builders<BsonDocument>.Filter.Eq("Properties.CorrelationId", correlationId)
            );

            var documents = await _logs
                .Find(filter)
                .Sort(Builders<BsonDocument>.Sort.Descending("Timestamp"))
                .ToListAsync(cancellationToken);

            return documents.Select(MapToLogEntry);
        }

        private static FilterDefinition<BsonDocument> ApplyDateFilter(
            FilterDefinition<BsonDocument> filter,
            DateTime? from,
            DateTime? to)
        {
            if (from.HasValue)
            {
                filter = Builders<BsonDocument>.Filter.And(
                    filter,
                    Builders<BsonDocument>.Filter.Gte("Timestamp", from.Value)
                );
            }

            if (to.HasValue)
            {
                filter = Builders<BsonDocument>.Filter.And(
                    filter,
                    Builders<BsonDocument>.Filter.Lte("Timestamp", to.Value)
                );
            }

            return filter;
        }

        private static LogEntry MapToLogEntry(BsonDocument doc)
        {
            var properties = GetDocument(doc, "Properties");
            var additionalData = GetDocument(doc, "AdditionalData");

            return new LogEntry
            {
                Id = GetString(doc, "_id") ?? string.Empty,

                Timestamp = GetDateTime(doc, "Timestamp"),

                Level = GetString(doc, "Level"),

                MessageTemplate = GetString(doc, "MessageTemplate"),

                RenderedMessage = GetString(doc, "RenderedMessage"),

                Message =
                    GetString(doc, "Message") ??
                    GetString(doc, "RenderedMessage") ??
                    GetString(doc, "MessageTemplate"),

                Exception = GetString(doc, "Exception"),

                Service =
                    GetString(doc, "Service") ??
                    GetString(properties, "Service") ??
                    GetString(properties, "SourceContext"),

                CorrelationId =
                    GetString(doc, "CorrelationId") ??
                    GetString(properties, "CorrelationId"),

                UserId = GetString(doc, "UserId"),

                Properties = properties.ElementCount > 0
                    ? ToDictionary(properties)
                    : null,

                AdditionalData = additionalData.ElementCount > 0
                    ? ToDictionary(additionalData)
                    : null
            };
        }

        private static BsonDocument GetDocument(BsonDocument doc, string key)
        {
            if (!doc.TryGetValue(key, out var value))
                return new BsonDocument();

            if (value.IsBsonNull)
                return new BsonDocument();

            if (!value.IsBsonDocument)
                return new BsonDocument();

            return value.AsBsonDocument;
        }

        private static string? GetString(BsonDocument doc, string key)
        {
            if (!doc.TryGetValue(key, out var value))
                return null;

            if (value.IsBsonNull)
                return null;

            return value switch
            {
                BsonString bsonString => bsonString.Value,
                BsonObjectId objectId => objectId.Value.ToString(),
                BsonDateTime dateTime => dateTime.ToUniversalTime().ToString("O"),
                _ => value.ToString()
            };
        }

        private static DateTime GetDateTime(BsonDocument doc, string key)
        {
            if (!doc.TryGetValue(key, out var value))
                return DateTime.MinValue;

            if (value.IsBsonNull)
                return DateTime.MinValue;

            if (value.IsBsonDateTime)
                return value.ToUniversalTime();

            if (value.IsString && DateTime.TryParse(value.AsString, out var parsed))
                return parsed.ToUniversalTime();

            return DateTime.MinValue;
        }

        private static Dictionary<string, object?> ToDictionary(BsonDocument doc)
        {
            return doc.Elements.ToDictionary(
                element => element.Name,
                element => NormalizeBsonValue(element.Value)
            );
        }

        private static object? NormalizeBsonValue(BsonValue value)
        {
            if (value == null || value.IsBsonNull)
                return null;

            if (value.IsString)
                return value.AsString;

            if (value.IsBoolean)
                return value.AsBoolean;

            if (value.IsInt32)
                return value.AsInt32;

            if (value.IsInt64)
                return value.AsInt64;

            if (value.IsDouble)
                return value.AsDouble;

            if (value.IsDecimal128)
                return Decimal128.ToDecimal(value.AsDecimal128);

            if (value.IsObjectId)
                return value.AsObjectId.ToString();

            if (value.IsValidDateTime)
                return value.ToUniversalTime();

            if (value.IsBsonDocument)
                return ToDictionary(value.AsBsonDocument);

            if (value.IsBsonArray)
                return value.AsBsonArray.Select(NormalizeBsonValue).ToList();

            return value.ToString();
        }

        private static BsonDocument ToBsonDocument(Dictionary<string, object?> dictionary)
        {
            var document = new BsonDocument();

            foreach (var item in dictionary)
            {
                document[item.Key] = item.Value == null
                    ? BsonNull.Value
                    : BsonValue.Create(item.Value);
            }

            return document;
        }
    }
}