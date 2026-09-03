namespace Homely.Api.Features.Wishes.CreateWish;

public record CreateWishRequest(string Title, string? Link, decimal? Price, Guid AddedByUserId, Guid HouseholdId);
