using ClipSync.Application.Sessions.Commands;
using FluentValidation;

namespace ClipSync.Application.Validators;

public class CreateSessionCommandValidator : AbstractValidator<CreateSessionCommand>
{
    public CreateSessionCommandValidator()
    {
        RuleFor(x => x.Alias)
            .NotEmpty().WithMessage("Alias is required.")
            .MaximumLength(32).WithMessage("Alias must be 32 characters or less.")
            .Matches(@"^[a-zA-Z0-9_\- ]+$").WithMessage("Alias contains invalid characters.");

    }
}

public class JoinSessionCommandValidator : AbstractValidator<JoinSessionCommand>
{
    public JoinSessionCommandValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Session code is required.")
            .Length(6).WithMessage("Session code must be exactly 6 characters.")
            .Matches(@"^[A-Za-z0-9]+$").WithMessage("Session code contains invalid characters.");

        RuleFor(x => x.Alias)
            .NotEmpty().WithMessage("Alias is required.")
            .MaximumLength(32).WithMessage("Alias must be 32 characters or less.")
            .Matches(@"^[a-zA-Z0-9_\- ]+$").WithMessage("Alias contains invalid characters.");
    }
}
