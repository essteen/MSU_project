using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Homely.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddHouseholdMembership : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_Households_HouseholdId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_HouseholdId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "HouseholdId",
                table: "Users");

            migrationBuilder.CreateTable(
                name: "HouseholdUser",
                columns: table => new
                {
                    HouseholdsHouseholdId = table.Column<Guid>(type: "uuid", nullable: false),
                    MembersId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HouseholdUser", x => new { x.HouseholdsHouseholdId, x.MembersId });
                    table.ForeignKey(
                        name: "FK_HouseholdUser_Households_HouseholdsHouseholdId",
                        column: x => x.HouseholdsHouseholdId,
                        principalTable: "Households",
                        principalColumn: "HouseholdId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_HouseholdUser_Users_MembersId",
                        column: x => x.MembersId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HouseholdUser_MembersId",
                table: "HouseholdUser",
                column: "MembersId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HouseholdUser");

            migrationBuilder.AddColumn<Guid>(
                name: "HouseholdId",
                table: "Users",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_HouseholdId",
                table: "Users",
                column: "HouseholdId");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Households_HouseholdId",
                table: "Users",
                column: "HouseholdId",
                principalTable: "Households",
                principalColumn: "HouseholdId");
        }
    }
}
