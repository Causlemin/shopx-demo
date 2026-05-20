namespace Domain.Entities
{
    public class CartSnapshot
    {
        public Guid Id { get; set; }
        public string CartId { get; set; } = null!;
        public Guid? UserId { get; set; }
        public List<CartSnapshotItem> Items { get; set; } = new ();
        public DateTime UpdatedAt { get; set;}
    }

    public class CartSnapshotItem
    {
        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public string? ImageUrl { get; set; }
    }
}