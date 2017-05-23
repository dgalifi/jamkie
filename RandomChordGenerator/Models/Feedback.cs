using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace RandomChordGenerator.Models
{
    public class Feedback
    {
        [Required]
        public string email { get; set; }

        public int score{ get; set; }

        [Required]
        public string comment { get; set; }
    }
}