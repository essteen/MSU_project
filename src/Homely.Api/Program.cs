using Homely.Api.Auth;
using Homely.Api.Features.Auth.Login;
using Homely.Api.Features.Auth.Register;
using Homely.Api.Features.Households.CreateHousehold;
using Homely.Api.Features.Households.GetHouseholds;
using Homely.Api.Features.Households.GetMyHouseholds;
using Homely.Api.Features.Households.JoinHousehold;
using Homely.Api.Features.Items.CreateItem;
using Homely.Api.Features.Items.GetItems;
using Homely.Api.Features.Users.GetUsers;
using Homely.Core.Entities;
using Homely.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<HomelyDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

builder.Services.AddSingleton<IPasswordHasher<User>, PasswordHasher<User>>();
builder.Services.AddSingleton<TokenService>();

var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSection["Key"];
if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new InvalidOperationException(
        "Jwt:Key is not configured. Set it via the Jwt__Key environment variable (or a Container App secret) " +
        "in production, or via appsettings.Development.json for local development.");
}

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtSection["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwtSection["Audience"],
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateLifetime = true
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

app.UseCors("FrontendPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.UseDefaultFiles();
app.UseStaticFiles();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<HomelyDbContext>();
    db.Database.Migrate();
}

app.MapCreateHousehold();
app.MapGetHouseholds();
app.MapGetMyHouseholds();
app.MapJoinHousehold();
app.MapGetUsers();
app.MapCreateItem();
app.MapGetItems();
app.MapRegister();
app.MapLogin();

app.MapFallbackToFile("index.html");

app.Run();
