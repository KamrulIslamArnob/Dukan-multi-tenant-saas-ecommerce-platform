using ErrorOr;

namespace Dukaan.Application.Features.Admin;

public static class AdminErrors
{
    public static Error SlugTaken => Error.Conflict("Admin.SlugTaken", "A tenant with this slug already exists.");
    public static Error EmailTaken => Error.Conflict("Admin.EmailTaken", "A user with this email already exists.");
}
