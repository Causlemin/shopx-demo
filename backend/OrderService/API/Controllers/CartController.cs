using Domain.Entities;
using Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    [ApiController]
    [Route("api/cart")]
    public class CartController: ControllerBase
    {
        private readonly ICartSnapshotRepository _cartRepository;
        public CartController(ICartSnapshotRepository cartRepository)
        {
            _cartRepository = cartRepository;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetCart()
        {
            var cartId = GetOrCreateCartId();
            var snapshot = await _cartRepository.GetByCartIdAsync(cartId);

            return Ok(snapshot?.Items ?? new List<CartSnapshotItem>());
        }

        [HttpPut]
        [AllowAnonymous]
        public async Task<IActionResult> SyncCart([FromBody] List<CartSnapshotItem> items)
        {
            var cartId = GetOrCreateCartId();
            var userId = GetUserId();
            var snapshot = new CartSnapshot
            {
                CartId = cartId,
                UserId = userId,
                Items = items,
            };

            await _cartRepository.UpsertAsync(snapshot);

            return Ok(snapshot.Items);
        }

        [HttpDelete]
        [AllowAnonymous]
        public async Task<IActionResult> ClearCart()
        {
            var cartId = GetOrCreateCartId();

            await _cartRepository.ClearAsync(cartId);

            return NoContent();
        }

        private string GetOrCreateCartId()
        {
            var cartId = Request.Cookies["cartId"];

            if (!string.IsNullOrEmpty(cartId))
                return cartId;

            cartId = Guid.NewGuid().ToString();

            Response.Cookies.Append("cartId", cartId, new CookieOptions
            {
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.Lax,
                Expires = DateTimeOffset.UtcNow.AddDays(7),
                Path = "/"
            });

            return cartId;
        }

        private Guid? GetUserId()
        {
            var userIdClaim =
                User.FindFirst("userId") ??
                User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
                return null;

            return Guid.TryParse(userIdClaim.Value, out var userId)
                ? userId
                : null;
        }
    }

}