using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Core;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities
{
    public class UpdateAttendace
    {
        public class Command : IRequest<Result<Unit>>
        {
            public Guid Id { get; set; }
        }
        public class Handler : IRequestHandler<Command, Result<Unit>>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;
            public Handler(DataContext context, IUserAccessor userAccessor)
            {
                this._userAccessor = userAccessor;
                this._context = context;

            }

            public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
            {
                var a = await _context.Activities
                    .Include(a => a.Attendees).ThenInclude(u => u.AppUser)
                    .SingleOrDefaultAsync(x => x.Id == request.Id);

                if (a == null) return null;

                var user = await _context.Users.FirstOrDefaultAsync(
                    x => x.UserName == _userAccessor.GetUsername()
                );

                if (user == null) return null;

                var HostUsername = a.Attendees.FirstOrDefault(
                    x => x.IsHost
                ).AppUser.UserName;

                var attendace = a.Attendees.FirstOrDefault(
                    x => x.AppUser.UserName == user.UserName
                );

                if (attendace != null && HostUsername == user.UserName)
                    a.IsCancelled = !a.IsCancelled;

                if (attendace != null && HostUsername != user.UserName)
                    a.Attendees.Remove(attendace);

                if (attendace == null)
                {
                    attendace = new ActivityAttendee
                    {
                        AppUser = user,
                        Activity = a,
                        IsHost = false
                    };

                    a.Attendees.Add(attendace);
                } 

                var result = await _context.SaveChangesAsync() > 0;

                return result ? 
                    Result<Unit>.Success(Unit.Value) : 
                    Result<Unit>.Failure("Problem updating attendance");
            }
        }
    }
}