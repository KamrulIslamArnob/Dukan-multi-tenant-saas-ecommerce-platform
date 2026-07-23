namespace Dukaan.Media.Application.Features.Upload;

using MediatR;

public class UploadMediaHandler : IRequestHandler<UploadMediaCommand, UploadMediaResponse>
{
    private readonly IMediaRepository _repository;

    public UploadMediaHandler(IMediaRepository repository)
    {
        _repository = repository;
    }

    public async Task<UploadMediaResponse> Handle(UploadMediaCommand request, CancellationToken cancellationToken)
    {
        var metadata = new MediaMetadata
        {
            Id = Guid.NewGuid(),
            FileName = request.FileName,
            ContentType = request.ContentType,
            FileSize = request.FileSize,
            UploadedBy = request.UploadedBy,
            Status = MediaStatus.Pending
        };

        await _repository.AddAsync(metadata, cancellationToken);
        await _repository.SaveAsync(cancellationToken);

        return new UploadMediaResponse { MediaId = metadata.Id, Status = metadata.Status.ToString() };
    }
}
