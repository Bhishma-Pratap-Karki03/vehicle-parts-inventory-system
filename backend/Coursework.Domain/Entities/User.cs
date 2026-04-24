using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Coursework.Domain.Entities;

public class User
{
    public int UserId { get; set; }

    public int RoleId { get; set; }
    public Role? Role { get; set; }

    [Required]
    [MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [Phone]
    [MaxLength(20)]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(250)]
    public string? Address { get; set; }

    [Required]
    [MaxLength(255)]
    public string PasswordHash { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal CreditsRemaining { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    public ICollection<PartRequest> PartRequests { get; set; } = new List<PartRequest>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}