﻿using System;
using System.Collections.Generic;

namespace KhoaLuan1.Models;

public partial class CartItem
{
    public int CartItemId { get; set; }

    public int UserId { get; set; }

    public int ProductId { get; set; }

    public int Quantity { get; set; }

    public string Status { get; set; } = null!;

    public virtual Product Product { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
