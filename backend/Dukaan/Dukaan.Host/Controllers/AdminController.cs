using Dukaan.Application.Dtos;
using Dukaan.Application.Features.Admin;
using Dukaan.Application.Features.Admin.GetAdminStats;
using Dukaan.Application.Features.Admin.GetAllTenants;
using Dukaan.Application.Features.Admin.GetAllMerchants;
using Dukaan.Application.Features.Admin.GetAllCustomers;
using Dukaan.Application.Features.Admin.CreateTenant;
using Dukaan.Application.Features.Admin.UpdateTenant;
using Dukaan.Application.Features.Admin.UpdateMerchant;
using Dukaan.Application.Features.Admin.DeleteTenant;
using Dukaan.Application.Features.Admin.CreateMerchant;
using Dukaan.Application.Features.Admin.DeleteMerchant;
using Dukaan.Application.Features.Admin.CreateCustomer;
using Dukaan.Application.Features.Admin.UpdateCustomer;
using Dukaan.Application.Features.Admin.DeleteCustomer;
using Dukaan.Application.Features.Admin.CancelOrder;
using Dukaan.Application.Features.Admin.GetAllOrders;
using Dukaan.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Dukaan.Host.Controllers;

[Authorize(Policy = "AdminOnly")]
public class AdminController(DbContext db) : BaseApiController
{
    [HttpGet("stats")]
    public async Task<ActionResult<AdminStatsDto>> GetStats()
        => ToActionResult(await Mediator.Send(new GetAdminStatsQuery()));

    [HttpGet("tenants")]
    public async Task<ActionResult<PagedResponse<TenantAdminDto>>> GetTenants(
        [FromQuery] PaginationRequest request)
        => ToActionResult(await Mediator.Send(new GetAllTenantsQuery(request)));

    [HttpGet("tenants/{id:guid}")]
    public async Task<ActionResult<TenantAdminDto>> GetTenant(Guid id)
    {
        var tenant = await db.Set<Tenant>().AsNoTracking().IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.Id == id);
        if (tenant is null) return NotFound();

        var dto = new TenantAdminDto(
            tenant.Id,
            tenant.StoreName,
            tenant.Slug,
            null,
            tenant.CreatedAt,
            await db.Set<Product>().AsNoTracking().IgnoreQueryFilters().CountAsync(p => p.TenantId == id),
            await db.Set<Order>().AsNoTracking().IgnoreQueryFilters().CountAsync(o => o.TenantId == id),
            await db.Set<Order>().AsNoTracking().IgnoreQueryFilters()
                .Where(o => o.TenantId == id && o.Status != Domain.Enums.OrderStatus.Cancelled)
                .SumAsync(o => (decimal?)o.Total) ?? 0,
            tenant.Category,
            tenant.Country,
            tenant.Currency
        );

        return Ok(dto);
    }

    [HttpPost("tenants")]
    public async Task<ActionResult<TenantAdminDto>> CreateTenant(
        [FromBody] CreateTenantCommand command)
        => ToActionResult(await Mediator.Send(command));

    [HttpPut("tenants/{id:guid}")]
    public async Task<ActionResult<TenantAdminDto>> UpdateTenant(
        Guid id, [FromBody] UpdateTenantCommand command)
    {
        if (id != command.TenantId) return BadRequest("Id mismatch.");
        return ToActionResult(await Mediator.Send(command));
    }

    [HttpDelete("tenants/{id:guid}")]
    public async Task<ActionResult> DeleteTenant(Guid id)
        => ToActionResult(await Mediator.Send(new DeleteTenantCommand(id)));

    [HttpGet("merchants")]
    public async Task<ActionResult<PagedResponse<MerchantAdminDto>>> GetMerchants(
        [FromQuery] PaginationRequest request)
        => ToActionResult(await Mediator.Send(new GetAllMerchantsQuery(request)));

    [HttpGet("merchants/{id:guid}")]
    public async Task<ActionResult<MerchantAdminDto>> GetMerchant(Guid id)
    {
        var dto = await (
            from u in db.Set<Application.Models.ApplicationUser>().AsNoTracking().IgnoreQueryFilters()
            where u.Id == id && u.UserType == Application.Models.UserType.Merchant
            join m in db.Set<Merchant>().AsNoTracking().IgnoreQueryFilters() on u.Id equals m.ApplicationUserId
            join t in db.Set<Tenant>().AsNoTracking().IgnoreQueryFilters() on m.TenantId equals t.Id
            select new MerchantAdminDto(u.Id, u.Email!, t.StoreName, t.Slug, u.RegisteredAt, 0, 0)
        ).FirstOrDefaultAsync();

        if (dto is null) return NotFound();
        return Ok(dto);
    }

    [HttpPost("merchants")]
    public async Task<ActionResult<MerchantAdminDto>> CreateMerchant(
        [FromBody] CreateMerchantCommand command)
        => ToActionResult(await Mediator.Send(command));

    [HttpPut("merchants/{id:guid}")]
    public async Task<ActionResult<MerchantAdminDto>> UpdateMerchant(
        Guid id, [FromBody] UpdateMerchantCommand command)
    {
        if (id != command.UserId) return BadRequest("Id mismatch.");
        return ToActionResult(await Mediator.Send(command));
    }

    [HttpDelete("merchants/{id:guid}")]
    public async Task<ActionResult> DeleteMerchant(Guid id)
        => ToActionResult(await Mediator.Send(new DeleteMerchantCommand(id)));

    [HttpGet("customers")]
    public async Task<ActionResult<PagedResponse<CustomerAdminDto>>> GetCustomers(
        [FromQuery] PaginationRequest request)
        => ToActionResult(await Mediator.Send(new GetAllCustomersQuery(request)));

    [HttpGet("customers/{id:guid}")]
    public async Task<ActionResult<CustomerAdminDto>> GetCustomer(Guid id)
    {
        var dto = await (
            from u in db.Set<Application.Models.ApplicationUser>().AsNoTracking().IgnoreQueryFilters()
            where u.Id == id && u.UserType == Application.Models.UserType.Customer
            join c in db.Set<Customer>().AsNoTracking().IgnoreQueryFilters() on u.Id equals c.ApplicationUserId
            join t in db.Set<Tenant>().AsNoTracking().IgnoreQueryFilters() on c.TenantId equals t.Id
            select new CustomerAdminDto(u.Id, u.Email!, c.FirstName, c.LastName, t.Slug, u.RegisteredAt, 0, 0)
        ).FirstOrDefaultAsync();

        if (dto is null) return NotFound();
        return Ok(dto);
    }

    [HttpPost("customers")]
    public async Task<ActionResult<CustomerAdminDto>> CreateCustomer(
        [FromBody] CreateCustomerCommand command)
        => ToActionResult(await Mediator.Send(command));

    [HttpPut("customers/{id:guid}")]
    public async Task<ActionResult<CustomerAdminDto>> UpdateCustomer(
        Guid id, [FromBody] UpdateCustomerCommand command)
    {
        if (id != command.UserId) return BadRequest("Id mismatch.");
        return ToActionResult(await Mediator.Send(command));
    }

    [HttpDelete("customers/{id:guid}")]
    public async Task<ActionResult> DeleteCustomer(Guid id)
        => ToActionResult(await Mediator.Send(new DeleteCustomerCommand(id)));

    [HttpGet("orders")]
    public async Task<ActionResult<PagedResponse<AdminOrderSummaryDto>>> GetOrders(
        [FromQuery] PaginationRequest request)
        => ToActionResult(await Mediator.Send(new GetAllOrdersQuery(request)));

    [HttpGet("orders/{id:guid}")]
    public async Task<ActionResult> GetOrder(Guid id)
    {
        var order = await db.Set<Order>().AsNoTracking().IgnoreQueryFilters()
            .Include(o => o.Items)
            .Include(o => o.Customer)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order is null) return NotFound();

        var tenant = await db.Set<Tenant>().AsNoTracking().IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.Id == order.TenantId);

        var dto = new
        {
            order.Id,
            order.OrderNumber,
            Status = order.Status.ToString(),
            StoreName = tenant?.StoreName ?? "",
            CustomerName = $"{order.Customer.FirstName} {order.Customer.LastName}",
            order.Subtotal,
            order.Total,
            order.CreatedAt,
            ItemCount = order.Items.Count,
            BillingAddress = new
            {
                order.BillingAddress.Street,
                order.BillingAddress.City,
                order.BillingAddress.District,
                order.BillingAddress.PostalCode,
                order.BillingAddress.Phone
            },
            DeliveryAddress = new
            {
                order.DeliveryAddress.Street,
                order.DeliveryAddress.City,
                order.DeliveryAddress.District,
                order.DeliveryAddress.PostalCode,
                order.DeliveryAddress.Phone
            },
            Items = order.Items.Select(i => new
            {
                i.ProductId,
                i.ProductName,
                i.UnitPrice,
                i.Quantity,
                i.Subtotal
            })
        };

        return Ok(dto);
    }

    [HttpPut("orders/{id:guid}/cancel")]
    public async Task<ActionResult> CancelOrder(Guid id)
        => ToActionResult(await Mediator.Send(new CancelOrderCommand(id)));
}
