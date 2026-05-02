using System.Linq;
using Dukaan.Application.Dtos;
using Dukaan.Application.Features.Categories.Dtos;
using Dukaan.Application.Features.Categories.Queries.GetActiveCategories;
using Dukaan.Infrastructure.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Dukaan.Application.Features.Products.Dtos;
using Dukaan.Application.Features.Products.Queries.GetProductById;
using Dukaan.Application.Features.Products.Queries.GetActiveProducts;
using Dukaan.Application.Features.Tenants.Queries.GetTenantIdFromSlug;
using Dukaan.Application.Features.Tenants.Queries.GetStorefrontTenant;
using Dukaan.Application.Features.Tenants.Dtos;
using Dukaan.Application.Features.Products.Queries.GetActiveProductsByCategory;

namespace Dukaan.Host.Controllers;

[Route("api/storefront")]
public class StorefrontController(
    ITenantProvider tenantProvider,
    ILogger<StorefrontController> logger) : BaseApiController
{
    [HttpGet("products")]
    public async Task<ActionResult<PagedResponse<ProductDto>>> GetProducts(
        [FromHeader(Name = "x-tenant-slug")] string? slug,
        [FromQuery] PaginationRequest request)
    {
        if (string.IsNullOrWhiteSpace(slug)) return NotFound();
        var tenantResult = await Mediator.Send(new GetTenantIdFromSlugQuery(slug));
        if (tenantResult.IsError) return NotFound();
        tenantProvider.SetTenantId(tenantResult.Value!.Value);
        
        return ToActionResult(await Mediator.Send(new GetActiveProductsQuery(request)));
    }

    [HttpGet("products/{id}")]
    public async Task<ActionResult<ProductDto>> GetProduct(
        [FromHeader(Name = "x-tenant-slug")] string? slug, 
        Guid id)
    {
        if (string.IsNullOrWhiteSpace(slug)) return NotFound();
        var tenantResult = await Mediator.Send(new GetTenantIdFromSlugQuery(slug));
        if (tenantResult.IsError) return NotFound();
        tenantProvider.SetTenantId(tenantResult.Value!.Value);
        
        return ToActionResult(await Mediator.Send(new GetProductByIdQuery(id)));
    }

    [HttpGet("categories")]
    public async Task<ActionResult<PagedResponse<CategoryDto>>> GetCategories(
    [FromHeader(Name = "x-tenant-slug")] string? slug,
    [FromQuery] PaginationRequest request)
    {
        if (string.IsNullOrWhiteSpace(slug)) return NotFound();
        var tenantResult = await Mediator.Send(new GetTenantIdFromSlugQuery(slug));
        if (tenantResult.IsError) return NotFound();
        tenantProvider.SetTenantId(tenantResult.Value!.Value);

        return ToActionResult(await Mediator.Send(new GetActiveCategoriesQuery(request)));
    }

    [HttpGet("store")]
    public async Task<ActionResult<StorefrontTenantDto>> GetStore(
        [FromHeader(Name = "x-tenant-slug")] string? slug)
    {
        logger.LogInformation("GetStore called with slug: {Slug}", slug);
        if (string.IsNullOrWhiteSpace(slug)) return NotFound();
        var result = await Mediator.Send(new GetStorefrontTenantQuery(slug));
        logger.LogInformation("GetStore result: {IsError}, Errors: {Errors}",
            result.IsError, result.IsError ? string.Join(", ", result.Errors.Select(e => e.Description)) : "none");
        return ToActionResult(result);
    }

    [HttpGet("categories/{categoryId}/products")]
    public async Task<ActionResult<PagedResponse<ProductDto>>> GetProductsByCategory(
        [FromHeader(Name = "x-tenant-slug")] string? slug,
        Guid categoryId, 
        [FromQuery] PaginationRequest request)
    {
        if (string.IsNullOrWhiteSpace(slug)) return NotFound();
        var tenantResult = await Mediator.Send(new GetTenantIdFromSlugQuery(slug));
        if (tenantResult.IsError) return NotFound();
        tenantProvider.SetTenantId(tenantResult.Value!.Value);
        
        return ToActionResult(await Mediator.Send(new GetActiveProductsByCategoryQuery(categoryId, request)));
    }
}
