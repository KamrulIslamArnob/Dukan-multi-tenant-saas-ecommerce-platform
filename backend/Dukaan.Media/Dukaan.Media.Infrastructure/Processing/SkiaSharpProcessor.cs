namespace Dukaan.Media.Infrastructure.Processing;

using SkiaSharp;

public class SkiaSharpProcessor : IImageProcessor
{
    public async Task<Stream> ResizeAsync(Stream input, string size, CancellationToken ct)
    {
        using var bitmap = SKBitmap.Decode(input);
        var dimensions = size.Split('x');
        var width = int.Parse(dimensions[0]);
        var height = int.Parse(dimensions[1]);
        var resized = bitmap.Resize(new SKImageInfo(width, height), SKFilterQuality.High);

        var output = new MemoryStream();
        resized.Encode(output, SKImageFormat.Png, 90);
        output.Position = 0;
        return output;
    }

    public async Task<Stream> CompressAsync(Stream input, int quality, CancellationToken ct)
    {
        using var bitmap = SKBitmap.Decode(input);
        var output = new MemoryStream();
        bitmap.Encode(output, SKImageFormat.Jpeg, quality);
        output.Position = 0;
        return output;
    }
}
