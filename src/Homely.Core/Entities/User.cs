using System.Text.Json.Serialization;

namespace Homely.Core.Entities;

public class User
{
    public Guid Id { get; set; }
    public string? Name { get; set; }

    [JsonIgnore]
    public List<Household> Households { get; set; } = new();

    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    [JsonIgnore]
    public string PasswordHash { get; set; } = string.Empty;

    public DateOnly BirthDate { get; set; }
}