using Homely.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Homely.Api.Features.Items.DeleteItem;

public static class DeleteItemHandler
{
    public static async Task<bool> HandleAsync(int itemId, HomelyDbContext db)
    {
        var item = await db.Items.FirstOrDefaultAsync(i => i.ItemId == itemId);
        if (item is null)
        {
            return false;
        }

        db.Items.Remove(item);
        await db.SaveChangesAsync();
        return true;
    }
}
