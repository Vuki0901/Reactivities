using Application.Core;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BaseApiController : ControllerBase
    {
        private IMediator _mediator;
        protected IMediator Mediator => 
            _mediator ??= HttpContext.RequestServices.GetService<IMediator>();

        protected ActionResult HandleResult<T> (Result<T> r)
        {
            if(r.IsSuccess && r.Value != null)
                return Ok(r.Value);
            if(r.IsSuccess && r.Value == null || r == null)
                return NotFound();
            return BadRequest(r.Error);
        }
    }
}