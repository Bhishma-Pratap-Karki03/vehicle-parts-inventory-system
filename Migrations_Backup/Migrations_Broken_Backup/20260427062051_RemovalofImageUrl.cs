using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Coursework.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemovalofImageUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Parts");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Parts",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }
    }
}
