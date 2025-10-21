using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Experience.Migrations
{
    public partial class AddLatLngToExperience : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "Experiences",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "Experiences",
                type: "float",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Experiences");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Experiences");
        }
    }
}
