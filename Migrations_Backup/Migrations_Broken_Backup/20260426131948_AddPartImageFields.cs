using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Coursework.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPartImageFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImagePublicId",
                table: "Parts",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Parts",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImagePublicId",
                table: "Parts");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Parts");
        }
    }
}
