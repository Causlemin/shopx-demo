using Microsoft.AspNetCore.SignalR;

namespace ApiGateway.Hubs;

public class CartHub : Hub
{
    public async Task AddToCart(object item)
    {
        await Clients.All.SendAsync("CartItemAdded", item);
    }

    public async Task SyncCart(object cart)
    {
        await Clients.All.SendAsync("CartSynced", cart);
    }

    public async Task OrderCompleted()
    {
        await Clients.All.SendAsync("OrderCompleted");
    }
}