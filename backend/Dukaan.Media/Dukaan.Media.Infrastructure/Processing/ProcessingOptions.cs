namespace Dukaan.Media.Infrastructure.Processing;

public class ProcessingOptions
{
    public int ThumbnailWidth { get; set; } = 150;
    public int ThumbnailHeight { get; set; } = 150;
    public int MediumWidth { get; set; } = 600;
    public int MediumHeight { get; set; } = 600;
    public int LargeWidth { get; set; } = 1200;
    public int LargeHeight { get; set; } = 1200;
    public int JpegQuality { get; set; } = 85;
}
