namespace Dukaan.Media.Application.Features.Upload;

using MediatR;

public record UploadMediaCommand : IRequest<UploadMediaResponse>
{
    public Stream FileStream { get; init; } = null!;
    public string FileName { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
    public long FileSize { get; init; }
    public Guid UploadedBy { get; init; }
}

public record UploadMediaResponse
{
    public Guid MediaId { get; init; }
    public string Status { get; init; } = string.Empty;
}
