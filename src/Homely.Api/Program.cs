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

builder.Services.AddDbContext<HomelyDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<HomelyDbContext>();
    db.Database.EnsureCreated();
}

app.MapCreateHousehold();
app.MapGetHouseholds();
app.MapCreateUser();
app.MapGetUsers();
app.MapCreateItem();
app.MapGetItems();

app.Run();
