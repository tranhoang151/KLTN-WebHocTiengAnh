﻿using System;
using System.Collections.Generic;

namespace KhoaLuan1.Models;

public partial class OrderDetail
{
    public int OrderDetailId { get; set; }

    public int OrderId { get; set; }

    public int ProductId { get; set; }

    public int Quantity { get; set; }

    public decimal Price { get; set; }

    public virtual Order Order { get; set; } = null!;

    public virtual Product Product { get; set; } = null!;

    public virtual ICollection<ProductReview> ProductReviews { get; set; } = new List<ProductReview>();
}
