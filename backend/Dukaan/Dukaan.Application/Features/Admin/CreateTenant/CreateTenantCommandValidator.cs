using FluentValidation;

namespace Dukaan.Application.Features.Admin.CreateTenant;

public class CreateTenantCommandValidator : AbstractValidator<CreateTenantCommand>
{
    public CreateTenantCommandValidator()
    {
        RuleFor(x => x.StoreName)
            .NotEmpty().WithMessage("Store name is required.")
            .MaximumLength(200).WithMessage("Store name must not exceed 200 characters.");

        RuleFor(x => x.Slug)
            .NotEmpty().WithMessage("Slug is required.")
            .MaximumLength(100).WithMessage("Slug must not exceed 100 characters.");

        RuleFor(x => x.Category)
            .MaximumLength(100).WithMessage("Category must not exceed 100 characters.");

        RuleFor(x => x.Country)
            .MaximumLength(2).WithMessage("Country must be a 2-letter code.");

        RuleFor(x => x.Currency)
            .MaximumLength(3).WithMessage("Currency must be a 3-letter code.");
    }
}
