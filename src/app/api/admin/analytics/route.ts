import { NextResponse } from "next/server";
import { getOrders, getProducts, getCustomOrders, getUsers } from "@/lib/server/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const exportType = searchParams.get("export");

    if (exportType === "orders") {
      const orders = await getOrders();
      const headers = "Order ID,Reference,Date,Customer Name,Customer Email,Customer Phone,Status,Subtotal,Discount,Total,Items Count\n";
      const rows = orders.map((o) => {
        const date = new Date(o.createdAt).toLocaleDateString();
        const itemCount = o.items.reduce((sum, i) => sum + i.quantity, 0);
        const calcSubtotal = o.subtotal || o.items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);
        const discount = o.discountAmount || 0;
        const total = o.totalAmount || (calcSubtotal - discount);
        return `"${o.id}","${o.reference}","${date}","${o.customer.name}","${o.customer.email}","${o.customer.phone}","${o.status}","${calcSubtotal}","${discount}","${total}","${itemCount}"`;
      }).join("\n");

      return new Response(headers + rows, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="happiwrapz-orders-${Date.now()}.csv"`,
        },
      });
    }

    if (exportType === "products") {
      const products = await getProducts();
      const headers = "Product ID,Name,Category,Price,In Stock,Stock Quantity,Low Stock Threshold\n";
      const rows = products.map((p) => {
        return `"${p.id}","${p.name}","${p.category}","${p.price}","${p.inStock}","${p.stockQuantity ?? 0}","${p.lowStockThreshold ?? 8}"`;
      }).join("\n");

      return new Response(headers + rows, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="happiwrapz-inventory-${Date.now()}.csv"`,
        },
      });
    }

    if (exportType === "customers") {
      const orders = await getOrders();
      const customerMap = new Map<string, { name: string; email: string; phone: string; address: string; totalSpend: number; orderCount: number }>();

      orders.forEach((o) => {
        const key = o.customer.email.toLowerCase();
        const existing = customerMap.get(key);
        const amount = o.totalAmount || 0;
        if (existing) {
          existing.orderCount += 1;
          existing.totalSpend += amount;
        } else {
          customerMap.set(key, {
            name: o.customer.name,
            email: o.customer.email,
            phone: o.customer.phone,
            address: `${o.customer.address}, ${o.customer.city}`,
            totalSpend: amount,
            orderCount: 1,
          });
        }
      });

      const headers = "Customer Name,Email,Phone,City Address,Order Count,Total Spend,AOV\n";
      const rows = Array.from(customerMap.values()).map((c) => {
        const aov = c.orderCount > 0 ? Math.round(c.totalSpend / c.orderCount) : 0;
        return `"${c.name}","${c.email}","${c.phone}","${c.address}","${c.orderCount}","${c.totalSpend}","${aov}"`;
      }).join("\n");

      return new Response(headers + rows, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="happiwrapz-customers-${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({ success: true, message: "Use ?export=orders, ?export=products, or ?export=customers" });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process analytics export" },
      { status: 500 }
    );
  }
}
