namespace Dukaan.Host.ModelBinding;

using System.Globalization;
using Microsoft.AspNetCore.Mvc.ModelBinding;

public class DecimalModelBinder : IModelBinder
{
    public Task BindModelAsync(ModelBindingContext bindingContext)
    {
        var valueProviderResult = bindingContext.ValueProvider.GetValue(bindingContext.ModelName);
        if (valueProviderResult == ValueProviderResult.None) return Task.CompletedTask;

        var value = valueProviderResult.FirstValue;
        if (string.IsNullOrEmpty(value)) return Task.CompletedTask;

        value = value.Replace(",", ".");
        if (decimal.TryParse(value, NumberStyles.Any, CultureInfo.InvariantCulture, out var result))
        {
            bindingContext.ModelState.SetModelValue(bindingContext.ModelName, result);
            bindingContext.Result = ModelBindingResult.Success(result);
        }
        else
        {
            bindingContext.ModelState.AddModelError(bindingContext.ModelName, "Invalid decimal value");
        }

        return Task.CompletedTask;
    }
}
