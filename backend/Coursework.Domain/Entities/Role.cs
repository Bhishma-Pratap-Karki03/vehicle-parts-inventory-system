using System.ComponentModel.DataAnnotations;

namespace Coursework.Domain.Entities;

public class Role
{
    public int RoleId { get; set; }

    [Required]
    [MaxLength(50)]
    public string RoleName { get; set; } = string.Empty;

    public ICollection<User> Users { get; set; } = new List<User>();
}