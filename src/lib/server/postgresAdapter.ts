import { sql, isPostgresConfigured } from "./postgres";
import { initializePostgresTables } from "./dbSchema";
import {
  Product,
  OrderRequest,
  CustomOrderRequest,
  Coupon,
  WebsiteSettings,
  User,
} from "@/lib/store/types";
import { ContactMessage, Subscriber } from "./db";

let tablesInitialized = false;

export async function ensurePostgresReady(initialData?: {
  products: Product[];
  coupons: Coupon[];
  websiteSettings: WebsiteSettings;
  users: User[];
  orders: OrderRequest[];
  customOrders: CustomOrderRequest[];
}): Promise<boolean> {
  if (!sql || !isPostgresConfigured) return false;
  if (tablesInitialized) return true;

  try {
    await initializePostgresTables(sql);
    tablesInitialized = true;

    // Check if products table is empty; if so, seed catalog without copying images
    if (initialData) {
      const existing = await sql`SELECT COUNT(*)::int as count FROM products`;
      if (existing[0]?.count === 0 && initialData.products?.length) {
        console.log("[Postgres] Seeding initial products (storing paths, no images copied)...");
        for (const p of initialData.products) {
          await sql`
            INSERT INTO products (
              id, slug, name, category, description, price, compare_at_price, images,
              in_stock, featured, options, stock_quantity, low_stock_threshold,
              is_made_to_order, flower_type, ribbon_color, wrapping_style,
              preparation_hours, tags, archived
            ) VALUES (
              ${p.id}, ${p.slug}, ${p.name}, ${p.category}, ${p.description}, ${p.price},
              ${p.compareAtPrice || null}, ${JSON.stringify(p.images || [])},
              ${p.inStock ?? true}, ${p.featured ?? false}, ${JSON.stringify(p.options || [])},
              ${p.stockQuantity ?? 50}, ${p.lowStockThreshold ?? 10}, ${p.isMadeToOrder ?? false},
              ${p.flowerType || null}, ${p.ribbonColor || null}, ${p.wrappingStyle || null},
              ${p.preparationHours || 3}, ${JSON.stringify(p.tags || [])}, ${p.archived ?? false}
            ) ON CONFLICT (id) DO NOTHING
          `;
        }
      }

      // Seed website settings if missing
      const settingsExist = await sql`SELECT COUNT(*)::int as count FROM website_settings WHERE id = 'default'`;
      if (settingsExist[0]?.count === 0 && initialData.websiteSettings) {
        const s = initialData.websiteSettings;
        await sql`
          INSERT INTO website_settings (
            id, data, published_at, updated_by
          ) VALUES (
            'default',
            ${JSON.stringify(s)},
            ${s.publishedAt || new Date().toISOString()},
            ${s.updatedBy || "Happiwrapz Owner"}
          ) ON CONFLICT (id) DO NOTHING
        `;
      }

      // Seed coupons if missing
      const couponsExist = await sql`SELECT COUNT(*)::int as count FROM coupons`;
      if (couponsExist[0]?.count === 0 && initialData.coupons?.length) {
        for (const c of initialData.coupons) {
          await sql`
            INSERT INTO coupons (
              id, code, type, value, min_order_amount,
              max_discount_amount, usage_limit, used_count, valid_from,
              valid_until, active, applicable_category, created_at
            ) VALUES (
              ${c.id}, ${c.code}, ${c.type}, ${c.value},
              ${c.minOrderAmount || 0}, ${c.maxDiscountAmount || null},
              ${c.usageLimit || 100}, ${c.usedCount || 0}, ${c.validFrom || null},
              ${c.validUntil || null}, ${c.active ?? true},
              ${c.applicableCategory || null}, ${c.createdAt || new Date().toISOString()}
            ) ON CONFLICT (id) DO NOTHING
          `;
        }
      }

      // Seed users if missing
      const usersExist = await sql`SELECT COUNT(*)::int as count FROM users`;
      if (usersExist[0]?.count === 0 && initialData.users?.length) {
        for (const u of initialData.users) {
          await sql`
            INSERT INTO users (
              id, name, email, role, avatar, created_at
            ) VALUES (
              ${u.id}, ${u.name}, ${u.email}, ${u.role},
              ${u.avatar || null}, ${u.createdAt || new Date().toISOString()}
            ) ON CONFLICT (id) DO NOTHING
          `;
        }
      }

      // Seed initial orders if empty
      const ordersExist = await sql`SELECT COUNT(*)::int as count FROM orders`;
      if (ordersExist[0]?.count === 0 && initialData.orders?.length) {
        for (const o of initialData.orders) {
          await sql`
            INSERT INTO orders (
              id, reference, status, items, customer, delivery_date, delivery_slot,
              notes, internal_notes, subtotal, discount_amount, coupon_code, delivery_fee,
              total_amount, custom_order_id, payment_method, payment_status,
              status_history, created_at, updated_at
            ) VALUES (
              ${o.id}, ${o.reference}, ${o.status},
              ${JSON.stringify(o.items || [])}, ${JSON.stringify(o.customer || {})},
              ${o.deliveryDate || null}, ${o.deliverySlot || null}, ${o.notes || null},
              ${o.internalNotes || null}, ${o.subtotal || 0}, ${o.discountAmount || 0},
              ${o.couponCode || null}, ${o.deliveryFee || 0}, ${o.totalAmount || 0},
              ${o.customOrderId || null},
              ${o.paymentMethod || "Zero Online Payment — WhatsApp Confirmed"},
              ${o.paymentStatus || "confirmed_whatsapp"},
              ${JSON.stringify(o.statusHistory || [])},
              ${o.createdAt || new Date().toISOString()},
              ${o.updatedAt || new Date().toISOString()}
            ) ON CONFLICT (id) DO NOTHING
          `;
        }
      }

      // Seed initial custom orders if empty
      const customExist = await sql`SELECT COUNT(*)::int as count FROM custom_orders`;
      if (customExist[0]?.count === 0 && initialData.customOrders?.length) {
        for (const co of initialData.customOrders) {
          await sql`
            INSERT INTO custom_orders (
              id, reference, customer, occasion, product_type, flower_preferences,
              stem_count, wrapping_style, box_style, personalization_text, gift_message,
              budget, desired_delivery_date, desired_delivery_slot, special_instructions,
              reference_images, status, assigned_admin, quotation, converted_order_id,
              status_history, created_at, updated_at
            ) VALUES (
              ${co.id}, ${co.reference}, ${JSON.stringify(co.customer || {})},
              ${co.occasion}, ${co.productType}, ${co.flowerPreferences},
              ${co.stemCount}, ${co.wrappingStyle}, ${co.boxStyle || null},
              ${co.personalizationText}, ${co.giftMessage || null}, ${co.budget},
              ${co.desiredDeliveryDate}, ${co.desiredDeliverySlot || null},
              ${co.specialInstructions || null}, ${JSON.stringify(co.referenceImages || [])},
              ${co.status}, ${co.assignedAdmin || null},
              ${co.quotation ? JSON.stringify(co.quotation) : null},
              ${co.convertedOrderId || null}, ${JSON.stringify(co.statusHistory || [])},
              ${co.createdAt || new Date().toISOString()},
              ${co.updatedAt || new Date().toISOString()}
            ) ON CONFLICT (id) DO NOTHING
          `;
        }
      }
    }

    return true;
  } catch (err) {
    console.warn("[Postgres] Failed to initialize tables:", err);
    return false;
  }
}

// ── Products ─────────────────────────────────────────────────────────────────

export async function pgGetProducts(): Promise<Product[] | null> {
  if (!sql || !isPostgresConfigured) return null;
  try {
    const rows = await sql`
      SELECT
        id, slug, name, category, description, price,
        compare_at_price as "compareAtPrice", images,
        in_stock as "inStock", featured, options,
        stock_quantity as "stockQuantity", low_stock_threshold as "lowStockThreshold",
        is_made_to_order as "isMadeToOrder", flower_type as "flowerType",
        ribbon_color as "ribbonColor", wrapping_style as "wrappingStyle",
        preparation_hours as "preparationHours", tags, archived
      FROM products
      ORDER BY created_at DESC
    `;
    return rows.map((r: any) => ({
      ...r,
      images: typeof r.images === "string" ? JSON.parse(r.images) : r.images,
      options: typeof r.options === "string" ? JSON.parse(r.options) : r.options,
      tags: typeof r.tags === "string" ? JSON.parse(r.tags) : r.tags,
    }));
  } catch (err) {
    console.warn("[Postgres] pgGetProducts error:", err);
    return null;
  }
}

export async function pgSaveProduct(p: Product): Promise<boolean> {
  if (!sql || !isPostgresConfigured) return false;
  try {
    await sql`
      INSERT INTO products (
        id, slug, name, category, description, price, compare_at_price, images,
        in_stock, featured, options, stock_quantity, low_stock_threshold,
        is_made_to_order, flower_type, ribbon_color, wrapping_style,
        preparation_hours, tags, archived, updated_at
      ) VALUES (
        ${p.id}, ${p.slug}, ${p.name}, ${p.category}, ${p.description}, ${p.price},
        ${p.compareAtPrice || null}, ${JSON.stringify(p.images || [])},
        ${p.inStock ?? true}, ${p.featured ?? false}, ${JSON.stringify(p.options || [])},
        ${p.stockQuantity ?? 50}, ${p.lowStockThreshold ?? 10}, ${p.isMadeToOrder ?? false},
        ${p.flowerType || null}, ${p.ribbonColor || null}, ${p.wrappingStyle || null},
        ${p.preparationHours || 3}, ${JSON.stringify(p.tags || [])}, ${p.archived ?? false}, NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug,
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        description = EXCLUDED.description,
        price = EXCLUDED.price,
        compare_at_price = EXCLUDED.compare_at_price,
        images = EXCLUDED.images,
        in_stock = EXCLUDED.in_stock,
        featured = EXCLUDED.featured,
        options = EXCLUDED.options,
        stock_quantity = EXCLUDED.stock_quantity,
        low_stock_threshold = EXCLUDED.low_stock_threshold,
        is_made_to_order = EXCLUDED.is_made_to_order,
        flower_type = EXCLUDED.flower_type,
        ribbon_color = EXCLUDED.ribbon_color,
        wrapping_style = EXCLUDED.wrapping_style,
        preparation_hours = EXCLUDED.preparation_hours,
        tags = EXCLUDED.tags,
        archived = EXCLUDED.archived,
        updated_at = NOW()
    `;
    return true;
  } catch (err) {
    console.warn("[Postgres] pgSaveProduct error:", err);
    return false;
  }
}

export async function pgDeleteProduct(id: string): Promise<boolean> {
  if (!sql || !isPostgresConfigured) return false;
  try {
    await sql`UPDATE products SET archived = true, in_stock = false, updated_at = NOW() WHERE id = ${id}`;
    return true;
  } catch (err) {
    console.warn("[Postgres] pgDeleteProduct error:", err);
    return false;
  }
}

// ── Orders ───────────────────────────────────────────────────────────────────

export async function pgGetOrders(): Promise<OrderRequest[] | null> {
  if (!sql || !isPostgresConfigured) return null;
  try {
    const rows = await sql`
      SELECT
        id, reference, status, items, customer,
        delivery_date as "deliveryDate", delivery_slot as "deliverySlot",
        notes, internal_notes as "internalNotes", subtotal,
        discount_amount as "discountAmount", coupon_code as "couponCode",
        delivery_fee as "deliveryFee", total_amount as "totalAmount",
        custom_order_id as "customOrderId", payment_method as "paymentMethod",
        payment_status as "paymentStatus", status_history as "statusHistory",
        created_at as "createdAt", updated_at as "updatedAt"
      FROM orders
      ORDER BY created_at DESC
    `;
    return rows.map((r: any) => ({
      ...r,
      items: typeof r.items === "string" ? JSON.parse(r.items) : r.items,
      customer: typeof r.customer === "string" ? JSON.parse(r.customer) : r.customer,
      statusHistory: typeof r.statusHistory === "string" ? JSON.parse(r.statusHistory) : r.statusHistory,
    }));
  } catch (err) {
    console.warn("[Postgres] pgGetOrders error:", err);
    return null;
  }
}

export async function pgSaveOrder(o: OrderRequest): Promise<boolean> {
  if (!sql || !isPostgresConfigured) return false;
  try {
    await sql`
      INSERT INTO orders (
        id, reference, status, items, customer, delivery_date, delivery_slot,
        notes, internal_notes, subtotal, discount_amount, coupon_code, delivery_fee,
        total_amount, custom_order_id, payment_method, payment_status,
        status_history, created_at, updated_at
      ) VALUES (
        ${o.id}, ${o.reference}, ${o.status},
        ${JSON.stringify(o.items || [])}, ${JSON.stringify(o.customer || {})},
        ${o.deliveryDate || null}, ${o.deliverySlot || null}, ${o.notes || null},
        ${o.internalNotes || null}, ${o.subtotal || 0}, ${o.discountAmount || 0},
        ${o.couponCode || null}, ${o.deliveryFee || 0}, ${o.totalAmount || 0},
        ${o.customOrderId || null},
        ${o.paymentMethod || "Zero Online Payment — WhatsApp Confirmed"},
        ${o.paymentStatus || "confirmed_whatsapp"},
        ${JSON.stringify(o.statusHistory || [])},
        ${o.createdAt || new Date().toISOString()},
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        items = EXCLUDED.items,
        customer = EXCLUDED.customer,
        delivery_date = EXCLUDED.delivery_date,
        delivery_slot = EXCLUDED.delivery_slot,
        notes = EXCLUDED.notes,
        internal_notes = EXCLUDED.internal_notes,
        subtotal = EXCLUDED.subtotal,
        discount_amount = EXCLUDED.discount_amount,
        coupon_code = EXCLUDED.coupon_code,
        delivery_fee = EXCLUDED.delivery_fee,
        total_amount = EXCLUDED.total_amount,
        payment_status = EXCLUDED.payment_status,
        status_history = EXCLUDED.status_history,
        updated_at = NOW()
    `;
    return true;
  } catch (err) {
    console.warn("[Postgres] pgSaveOrder error:", err);
    return false;
  }
}

// ── Custom Orders ────────────────────────────────────────────────────────────

export async function pgGetCustomOrders(): Promise<CustomOrderRequest[] | null> {
  if (!sql || !isPostgresConfigured) return null;
  try {
    const rows = await sql`
      SELECT
        id, reference, customer, occasion, product_type as "productType",
        flower_preferences as "flowerPreferences", stem_count as "stemCount",
        wrapping_style as "wrappingStyle", box_style as "boxStyle",
        personalization_text as "personalizationText", gift_message as "giftMessage",
        budget, desired_delivery_date as "desiredDeliveryDate",
        desired_delivery_slot as "desiredDeliverySlot",
        special_instructions as "specialInstructions",
        reference_images as "referenceImages", status,
        assigned_admin as "assignedAdmin", quotation,
        converted_order_id as "convertedOrderId",
        status_history as "statusHistory",
        created_at as "createdAt", updated_at as "updatedAt"
      FROM custom_orders
      ORDER BY created_at DESC
    `;
    return rows.map((r: any) => ({
      ...r,
      customer: typeof r.customer === "string" ? JSON.parse(r.customer) : r.customer,
      referenceImages: typeof r.referenceImages === "string" ? JSON.parse(r.referenceImages) : r.referenceImages,
      quotation: typeof r.quotation === "string" ? JSON.parse(r.quotation) : r.quotation,
      statusHistory: typeof r.statusHistory === "string" ? JSON.parse(r.statusHistory) : r.statusHistory,
    }));
  } catch (err) {
    console.warn("[Postgres] pgGetCustomOrders error:", err);
    return null;
  }
}

export async function pgSaveCustomOrder(co: CustomOrderRequest): Promise<boolean> {
  if (!sql || !isPostgresConfigured) return false;
  try {
    await sql`
      INSERT INTO custom_orders (
        id, reference, customer, occasion, product_type, flower_preferences,
        stem_count, wrapping_style, box_style, personalization_text, gift_message,
        budget, desired_delivery_date, desired_delivery_slot, special_instructions,
        reference_images, status, assigned_admin, quotation, converted_order_id,
        status_history, created_at, updated_at
      ) VALUES (
        ${co.id}, ${co.reference}, ${JSON.stringify(co.customer || {})},
        ${co.occasion}, ${co.productType}, ${co.flowerPreferences},
        ${co.stemCount}, ${co.wrappingStyle}, ${co.boxStyle || null},
        ${co.personalizationText}, ${co.giftMessage || null}, ${co.budget},
        ${co.desiredDeliveryDate}, ${co.desiredDeliverySlot || null},
        ${co.specialInstructions || null}, ${JSON.stringify(co.referenceImages || [])},
        ${co.status}, ${co.assignedAdmin || null},
        ${co.quotation ? JSON.stringify(co.quotation) : null},
        ${co.convertedOrderId || null}, ${JSON.stringify(co.statusHistory || [])},
        ${co.createdAt || new Date().toISOString()},
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        customer = EXCLUDED.customer,
        status = EXCLUDED.status,
        assigned_admin = EXCLUDED.assigned_admin,
        quotation = EXCLUDED.quotation,
        converted_order_id = EXCLUDED.converted_order_id,
        status_history = EXCLUDED.status_history,
        updated_at = NOW()
    `;
    return true;
  } catch (err) {
    console.warn("[Postgres] pgSaveCustomOrder error:", err);
    return false;
  }
}

// ── Coupons ──────────────────────────────────────────────────────────────────

export async function pgGetCoupons(): Promise<Coupon[] | null> {
  if (!sql || !isPostgresConfigured) return null;
  try {
    const rows = await sql`
      SELECT
        id, code, type, value, min_order_amount as "minOrderAmount",
        max_discount_amount as "maxDiscountAmount", usage_limit as "usageLimit",
        used_count as "usedCount", valid_from as "validFrom",
        valid_until as "validUntil", active,
        applicable_category as "applicableCategory", created_at as "createdAt"
      FROM coupons
      ORDER BY created_at DESC
    `;
    return rows as unknown as Coupon[];
  } catch (err) {
    console.warn("[Postgres] pgGetCoupons error:", err);
    return null;
  }
}

export async function pgSaveCoupon(c: Coupon): Promise<boolean> {
  if (!sql || !isPostgresConfigured) return false;
  try {
    await sql`
      INSERT INTO coupons (
        id, code, type, value, min_order_amount,
        max_discount_amount, usage_limit, used_count, valid_from,
        valid_until, active, applicable_category, created_at
      ) VALUES (
        ${c.id}, ${c.code}, ${c.type}, ${c.value},
        ${c.minOrderAmount || 0}, ${c.maxDiscountAmount || null},
        ${c.usageLimit || 100}, ${c.usedCount || 0}, ${c.validFrom || null},
        ${c.validUntil || null}, ${c.active ?? true},
        ${c.applicableCategory || null}, ${c.createdAt || new Date().toISOString()}
      )
      ON CONFLICT (id) DO UPDATE SET
        value = EXCLUDED.value,
        active = EXCLUDED.active,
        used_count = EXCLUDED.used_count
    `;
    return true;
  } catch (err) {
    console.warn("[Postgres] pgSaveCoupon error:", err);
    return false;
  }
}

// ── Website Settings ─────────────────────────────────────────────────────────

export async function pgGetWebsiteSettings(): Promise<WebsiteSettings | null> {
  if (!sql || !isPostgresConfigured) return null;
  try {
    const rows = await sql`
      SELECT data, published_at as "publishedAt", updated_by as "updatedBy"
      FROM website_settings
      WHERE id = 'default'
      LIMIT 1
    `;
    if (!rows || rows.length === 0) return null;
    const r = rows[0] as any;
    const data = typeof r.data === "string" ? JSON.parse(r.data) : r.data;
    return {
      ...data,
      publishedAt: r.publishedAt || data.publishedAt,
      updatedBy: r.updatedBy || data.updatedBy,
    };
  } catch (err) {
    console.warn("[Postgres] pgGetWebsiteSettings error:", err);
    return null;
  }
}

export async function pgSaveWebsiteSettings(s: WebsiteSettings): Promise<boolean> {
  if (!sql || !isPostgresConfigured) return false;
  try {
    await sql`
      INSERT INTO website_settings (
        id, data, published_at, updated_by
      ) VALUES (
        'default',
        ${JSON.stringify(s)},
        NOW(),
        ${s.updatedBy || "Happiwrapz Owner"}
      )
      ON CONFLICT (id) DO UPDATE SET
        data = EXCLUDED.data,
        published_at = NOW(),
        updated_by = EXCLUDED.updated_by
    `;
    return true;
  } catch (err) {
    console.warn("[Postgres] pgSaveWebsiteSettings error:", err);
    return false;
  }
}

// ── Users ────────────────────────────────────────────────────────────────────

export async function pgGetUsers(): Promise<User[] | null> {
  if (!sql || !isPostgresConfigured) return null;
  try {
    const rows = await sql`
      SELECT
        id, name, email, role, avatar,
        created_at as "createdAt"
      FROM users
      ORDER BY created_at DESC
    `;
    return rows as unknown as User[];
  } catch (err) {
    console.warn("[Postgres] pgGetUsers error:", err);
    return null;
  }
}

export async function pgSaveUser(u: User): Promise<boolean> {
  if (!sql || !isPostgresConfigured) return false;
  try {
    await sql`
      INSERT INTO users (
        id, name, email, role, avatar, created_at
      ) VALUES (
        ${u.id}, ${u.name}, ${u.email}, ${u.role},
        ${u.avatar || null}, ${u.createdAt || new Date().toISOString()}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        avatar = EXCLUDED.avatar
    `;
    return true;
  } catch (err) {
    console.warn("[Postgres] pgSaveUser error:", err);
    return false;
  }
}

// ── Contact Messages & Subscribers ───────────────────────────────────────────

export async function pgSaveContact(c: ContactMessage): Promise<boolean> {
  if (!sql || !isPostgresConfigured) return false;
  try {
    await sql`
      INSERT INTO contact_messages (
        id, name, email, phone, subject, message, created_at, status
      ) VALUES (
        ${c.id}, ${c.name}, ${c.email}, ${c.phone || null},
        ${c.subject || null}, ${c.message}, ${c.createdAt}, ${c.status}
      )
    `;
    return true;
  } catch (err) {
    console.warn("[Postgres] pgSaveContact error:", err);
    return false;
  }
}

export async function pgSaveSubscriber(s: Subscriber): Promise<boolean> {
  if (!sql || !isPostgresConfigured) return false;
  try {
    await sql`
      INSERT INTO subscribers (id, email, subscribed_at, active)
      VALUES (${s.id}, ${s.email}, ${s.subscribedAt}, ${s.active})
      ON CONFLICT (email) DO NOTHING
    `;
    return true;
  } catch (err) {
    console.warn("[Postgres] pgSaveSubscriber error:", err);
    return false;
  }
}
