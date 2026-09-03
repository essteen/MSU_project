using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Homely.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWishes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Wish_Households_HouseholdId",
                table: "Wish");

            migrationBuilder.DropForeignKey(
                name: "FK_Wish_Users_AddedByUserId",
                table: "Wish");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Wish",
                table: "Wish");

            migrationBuilder.RenameTable(
                name: "Wish",
                newName: "Wishes");

            migrationBuilder.RenameIndex(
                name: "IX_Wish_HouseholdId",
                table: "Wishes",
                newName: "IX_Wishes_HouseholdId");

            migrationBuilder.RenameIndex(
                name: "IX_Wish_AddedByUserId",
                table: "Wishes",
                newName: "IX_Wishes_AddedByUserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Wishes",
                table: "Wishes",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Wishes_Households_HouseholdId",
                table: "Wishes",
                column: "HouseholdId",
                principalTable: "Households",
                principalColumn: "HouseholdId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Wishes_Users_AddedByUserId",
                table: "Wishes",
                column: "AddedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Wishes_Households_HouseholdId",
                table: "Wishes");

            migrationBuilder.DropForeignKey(
                name: "FK_Wishes_Users_AddedByUserId",
                table: "Wishes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Wishes",
                table: "Wishes");

            migrationBuilder.RenameTable(
                name: "Wishes",
                newName: "Wish");

            migrationBuilder.RenameIndex(
                name: "IX_Wishes_HouseholdId",
                table: "Wish",
                newName: "IX_Wish_HouseholdId");

            migrationBuilder.RenameIndex(
                name: "IX_Wishes_AddedByUserId",
                table: "Wish",
                newName: "IX_Wish_AddedByUserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Wish",
                table: "Wish",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Wish_Households_HouseholdId",
                table: "Wish",
                column: "HouseholdId",
                principalTable: "Households",
                principalColumn: "HouseholdId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Wish_Users_AddedByUserId",
                table: "Wish",
                column: "AddedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
