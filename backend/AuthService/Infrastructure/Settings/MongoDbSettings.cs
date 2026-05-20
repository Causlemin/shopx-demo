namespace Infrastructure.Settings
{
    public class MongoDbSettings
    {
        public string ConnectionString { get; set; } = null!;
        public string DatabaseName { get; set; } = null!;
        public bool UseTls { get; set; }
        public string? CertificatePath { get; set; }
        public string? CertificatePassword { get; set; }
    }
}