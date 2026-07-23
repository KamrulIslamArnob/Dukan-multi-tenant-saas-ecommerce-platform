namespace Dukaan.Media.Application.Features.Processing;

using MediatR;

public class ProcessMediaHandler : IRequestHandler<ProcessMediaCommand, ProcessMediaResponse>
{
    private readonly IStorageProvider _storage;
    private readonly IImageProcessor _processor;

    public ProcessMediaHandler(IStorageProvider storage, IImageProcessor processor)
    {
        _storage = storage;
        _processor = processor;
    }

    public async Task<ProcessMediaResponse> Handle(ProcessMediaCommand request, CancellationToken cancellationToken)
    {
        var stream = await _storage.DownloadAsync(request.MediaId.ToString(), cancellationToken);
        var variants = new List<string>();

        foreach (var size in request.Variants)
        {
            var processed = await _processor.ResizeAsync(stream, size, cancellationToken);
            var variantId = $"{request.MediaId}_{size}";
            await _storage.UploadAsync(variantId, processed, cancellationToken);
            variants.Add(variantId);
        }

        return new ProcessMediaResponse { Success = true, GeneratedVariants = variants.ToArray() };
    }
}
