namespace Dukaan.Media.Application.Features.Processing;

using MediatR;

public record ProcessMediaCommand : IRequest<ProcessMediaResponse>
{
    public Guid MediaId { get; init; }
    public string[] Variants { get; init; } = Array.Empty<string>();
}

public record ProcessMediaResponse
{
    public bool Success { get; init; }
    public string[] GeneratedVariants { get; init; } = Array.Empty<string>();
}
