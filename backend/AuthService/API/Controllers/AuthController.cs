using MediatR;
using Microsoft.AspNetCore.Mvc;
using Application.Features.Auth.Commands;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController(IMediator mediator) : ControllerBase
    {
        private readonly IMediator _mediator = mediator;

        private void SetAuthCookies(string accessToken, string refreshToken)
        {
            var accessCookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = false, // demomuz için false, production'da true
                SameSite = SameSiteMode.Lax, // demomuz için Lax, production'da None (cross-site durumuna göre)
                Expires = DateTimeOffset.UtcNow.AddMinutes(15),
                Path = "/"
            };

            var refreshCookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = false, // demomuz için false, production'da true
                SameSite = SameSiteMode.Lax, // demomuz için Lax, production'da None (cross-site durumuna göre)
                Expires = DateTimeOffset.UtcNow.AddDays(7),
                Path = "/"
            };

            Response.Cookies.Append("accessToken", accessToken, accessCookieOptions);
            Response.Cookies.Append("refreshToken", refreshToken, refreshCookieOptions);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterCommand command)
        {
            var result = await _mediator.Send(command);
            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginCommand command)
        {
            var result = await _mediator.Send(command);

            if (!result.Success)
                return Unauthorized(result);

            if (!string.IsNullOrEmpty(result.AccessToken) && !string.IsNullOrEmpty(result.RefreshToken))
            {
                SetAuthCookies(result.AccessToken, result.RefreshToken);
            }

            return Ok(result);
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            var refreshToken = Request.Cookies["refreshToken"];

            if (string.IsNullOrEmpty(refreshToken))
            {
                return Unauthorized(new
                {
                    Success = false,
                    Message = "Refresh token not found"
                });
            }

            var result = await _mediator.Send(new RefreshTokenCommand
            {
                RefreshToken = refreshToken
            });

            if (!result.Success)
                return Unauthorized(result);

            if (!string.IsNullOrEmpty(result.AccessToken) && !string.IsNullOrEmpty(result.RefreshToken))
            {
                SetAuthCookies(result.AccessToken, result.RefreshToken);
            }

            return Ok(result);
        }

        [HttpGet("me")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public IActionResult Me()
        {
            var userId =
                User.FindFirst("userId")?.Value ??
                User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            var email =
                User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Email)?.Value ??
                User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

            var username =
                User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.UniqueName)?.Value ??
                User.Identity?.Name;

            var roles = User
                .FindAll(System.Security.Claims.ClaimTypes.Role)
                .Select(x => x.Value)
                .ToList();

            return Ok(new
            {
                id = userId,
                email,
                username,
                roles
            });
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("accessToken");
            Response.Cookies.Delete("refreshToken");

            return Ok(new
            {
                Success = true,
                Message = "Logged out successfully"
            });
        }
    }
}