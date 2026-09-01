using Homely.Api.Features.Households.CreateHousehold;
using Homely.Api.Features.Households.GetHouseholds;
using Homely.Api.Features.Items.CreateItem;
using Homely.Api.Features.Items.GetItems;
using Homely.Api.Features.Users.CreateUser;
using Homely.Api.Features.Users.GetUsers;
using Homely.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
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

var app = builder.Build();

app.UseCors("FrontendPolicy");
app.UseDefaultFiles();
app.UseStaticFiles();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<HomelyDbContext>();
    db.Database.Migrate();
}

app.MapCreateHousehold();
app.MapGetHouseholds();
app.MapCreateUser();
app.MapGetUsers();
app.MapCreateItem();
app.MapGetItems();

app.MapFallbackToFile("index.html");

app.Run();
