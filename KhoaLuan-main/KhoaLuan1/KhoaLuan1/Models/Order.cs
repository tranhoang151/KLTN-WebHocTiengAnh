﻿using System;
using System.Collections.Generic;

namespace KhoaLuan1.Models;

public partial class Order
{
    public int OrderId { get; set; }

    public int UserId { get; set; }

    public int RestaurantId { get; set; }

    public int? DeliveryPersonId { get; set; }

    public DateTime OrderDate { get; set; }

    public string Status { get; set; } = null!;

    public decimal TotalAmount { get; set; }

    public string? Address { get; set; }

    public string? PaymentMethod { get; set; }

    public string? PaymentStatus { get; set; }

    public decimal? Latitude { get; set; }

    public decimal? Longitude { get; set; }

    public decimal? DistanceKm { get; set; }

    public decimal DiscountAmount { get; set; }

    public decimal ShipFee { get; set; }

    public string? TransactionId { get; set; }

    public DateTime? PaymentDate { get; set; }

    public virtual User? DeliveryPerson { get; set; }

    public virtual ICollection<DeliveryTracking> DeliveryTrackings { get; set; } = new List<DeliveryTracking>();

    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();

    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    public virtual Restaurant Restaurant { get; set; } = null!;

    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();

    public virtual User User { get; set; } = null!;
}
