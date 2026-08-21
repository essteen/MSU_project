using Homely.Core.Entities;

namespace Homely.Api.Features.Items.CreateItem;

public record CreateItemRequest(string Name, Category Category, decimal? Price, Guid OwnerId, Guid HouseholdId);
