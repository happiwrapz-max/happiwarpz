"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice, formatDate, formatDateTime } from "@/lib/utils";
import {
  ArrowLeft,
  Phone,
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  Trash2,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calculator,
  Send,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { RibbonEmblem } from "@/components/ui/RibbonEmblem";
import { CustomOrderRequest, QuotationLineItem } from "@/lib/store/types";

export default function CustomOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [custom, setCustom] = useState<CustomOrderRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingQuote, setSavingQuote] = useState(false);
  const [converting, setConverting] = useState(false);

  // Quotation Builder State
  const [lineItems, setLineItems] = useState<QuotationLineItem[]>([
    {
      id: "li-1",
      description: "Handcrafted Satin Ribbon Roses (Custom Fold)",
      quantity: 50,
      unitPrice: 50,
      total: 2500,
    },
  ]);
  const [customizationFee, setCustomizationFee] = useState<number>(350);
  const [packagingFee, setPackagingFee] = useState<number>(450);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [materialCost, setMaterialCost] = useState<number>(1200);
  const [laborCost, setLaborCost] = useState<number>(800);
  const [notes, setNotes] = useState<string>("Hand-tied with double-face satin ribbon in bespoke packaging.");

  const fetchCustomOrder = async () => {
    try {
      const res = await fetch(`/api/admin/custom-orders/${id}`);
      const data = await res.json();
      if (data.success && data.customOrder) {
        setCustom(data.customOrder);
        // Hydrate quote state if exists
        if (data.customOrder.quotation) {
          const q = data.customOrder.quotation;
          setLineItems(q.lineItems || []);
          setCustomizationFee(q.customizationFee || 0);
          setPackagingFee(q.packagingFee || 0);
          setDeliveryFee(q.deliveryFee || 0);
          setDiscount(q.discount || 0);
          setMaterialCost(q.materialCostEstimate || 0);
          setLaborCost(q.laborCostEstimate || 0);
          setNotes(q.notes || "");
        }
      }
    } catch (err) {
      console.error("Custom order fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomOrder();
  }, [id]);

  // Line item helpers
  const handleAddLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: `li-${Date.now()}`,
        description: "Artisan Keepsake Addition",
        quantity: 1,
        unitPrice: 299,
        total: 299,
      },
    ]);
  };

  const handleUpdateLineItem = (
    index: number,
    field: "description" | "quantity" | "unitPrice",
    val: any
  ) => {
    setLineItems((prev) => {
      const copy = [...prev];
      const item = { ...copy[index] };
      if (field === "description") item.description = val;
      else if (field === "quantity") {
        item.quantity = Number(val);
        item.total = item.quantity * item.unitPrice;
      } else if (field === "unitPrice") {
        item.unitPrice = Number(val);
        item.total = item.quantity * item.unitPrice;
      }
      copy[index] = item;
      return copy;
    });
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Totals calculations
  const itemsSubtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const quotationTotal = Math.max(
    0,
    itemsSubtotal + customizationFee + packagingFee + deliveryFee - discount
  );

  // Profitability calculations
  const totalCost = materialCost + laborCost;
  const estimatedGrossProfit = quotationTotal - totalCost;
  const grossMarginPercent =
    quotationTotal > 0 ? Math.round((estimatedGrossProfit / quotationTotal) * 100) : 0;

  // Save quotation
  const handleSaveQuotation = async (status: "draft" | "sent") => {
    setSavingQuote(true);
    try {
      const res = await fetch(`/api/admin/custom-orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_quotation",
          quotation: {
            lineItems,
            customizationFee,
            packagingFee,
            deliveryFee,
            discount,
            tax: 0,
            total: quotationTotal,
            estimatedPrepTimeHours: 12,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            notes,
            status,
            materialCostEstimate: materialCost,
            laborCostEstimate: laborCost,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchCustomOrder();
      }
    } catch (err) {
      console.warn("Save quotation error:", err);
    } finally {
      setSavingQuote(false);
    }
  };

  // Convert to Order atomic transaction
  const handleConvertToOrder = async () => {
    if (!confirm("Convert this custom quotation into a confirmed standard order?")) return;
    setConverting(true);
    try {
      const res = await fetch(`/api/admin/custom-orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "convert_to_order",
          actorName: "Happiwrapz Owner",
          actorRole: "owner",
        }),
      });
      const data = await res.json();
      if (data.success && data.order) {
        router.push(`/admin/orders/${data.order.id}`);
      } else {
        alert(data.error || "Failed to convert to order.");
      }
    } catch (err) {
      console.error("Convert to order error:", err);
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-[#888]">Loading commission details...</div>;
  }

  if (!custom) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-[#EFEAE2]">
        <h2 className="font-serif text-2xl text-[#1E1E1E]">Commission Not Found</h2>
        <Link href="/admin/custom-orders" className="text-xs text-[#E10600] font-semibold mt-2 inline-block">
          ← Return to Custom Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFEAE2]">
        <div>
          <Link
            href="/admin/custom-orders"
            className="inline-flex items-center gap-1.5 text-xs font-serif font-semibold text-[#888] hover:text-[#E10600] mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Custom Orders</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-2xl sm:text-3xl font-bold text-[#1E1E1E]">
              {custom.reference}
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FAF8F5] border border-[#EFEAE2] text-[#E10600]">
              {custom.occasion}
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
              {custom.status.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {/* Action: Convert to Order CTA if Quotation Exists */}
        {custom.convertedOrderId ? (
          <Link
            href={`/admin/orders/${custom.convertedOrderId}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-serif font-semibold uppercase tracking-wider shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>View Converted Order ({custom.convertedOrderId})</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleConvertToOrder}
            disabled={converting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#E10600] hover:bg-[#C20500] text-white text-xs font-serif font-semibold uppercase tracking-wider transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RibbonEmblem className="w-4 h-4" />
            <span>Convert to Confirmed Order</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Client Specifications & Quotation Builder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Specifications Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
            <h2 className="font-serif text-base font-bold text-[#1E1E1E]">
              Bespoke Commission Specifications
            </h2>

            <div className="grid grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#888] block">Flower Preference</span>
                <p className="font-semibold text-[#1E1E1E] mt-0.5">{custom.flowerPreferences}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#888] block">Stem Count & Format</span>
                <p className="font-semibold text-[#1E1E1E] mt-0.5">{custom.stemCount} Blooms • {custom.productType}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#888] block">Wrapping Style</span>
                <p className="font-semibold text-[#1E1E1E] mt-0.5">{custom.wrappingStyle}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#888] block">Presentation Format</span>
                <p className="font-semibold text-[#1E1E1E] mt-0.5">{custom.boxStyle || "Standard Signature Wrap"}</p>
              </div>
            </div>

            {custom.personalizationText && (
              <div className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#EFEAE2] text-xs">
                <span className="text-[10px] uppercase font-bold text-[#E10600] block mb-0.5">
                  Custom Ribbon Gold Foil Calligraphy:
                </span>
                <p className="font-serif font-semibold text-[#1E1E1E] italic">
                  "{custom.personalizationText}"
                </p>
              </div>
            )}

            {custom.specialInstructions && (
              <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80 text-xs text-amber-900">
                <span className="text-[10px] uppercase font-bold block mb-0.5">Venue & Delivery Instructions:</span>
                <p>{custom.specialInstructions}</p>
              </div>
            )}
          </div>

          {/* Quotation Builder Module */}
          <div className="bg-white p-6 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-base font-bold text-[#1E1E1E]">
                  Formal Quotation Builder
                </h2>
                <p className="text-xs text-[#777]">
                  Assemble line items, customization fees, packaging charges, and discount allowances.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddLineItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#EFEAE2] hover:border-[#E10600] text-xs font-serif font-semibold text-[#1E1E1E] hover:text-[#E10600] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Line Item</span>
              </button>
            </div>

            {/* Line Items Table */}
            <div className="space-y-2.5">
              {lineItems.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-2 text-xs">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleUpdateLineItem(idx, "description", e.target.value)}
                    placeholder="Item description..."
                    className="flex-1 px-3 py-2 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600]"
                  />
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleUpdateLineItem(idx, "quantity", e.target.value)}
                    className="w-16 px-2 py-2 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-center text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600]"
                    title="Qty"
                  />
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => handleUpdateLineItem(idx, "unitPrice", e.target.value)}
                    className="w-24 px-2 py-2 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-right text-[#1E1E1E] focus:outline-hidden focus:border-[#E10600]"
                    title="Unit Price"
                  />
                  <span className="w-24 text-right font-mono font-bold text-[#1E1E1E]">
                    {formatPrice(item.total)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveLineItem(idx)}
                    className="p-1.5 text-[#AAA] hover:text-red-600 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Additional Charges / Adjustments */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#EFEAE2] text-xs">
              <div>
                <label className="text-[10px] font-bold text-[#888] uppercase block mb-1">Customization</label>
                <input
                  type="number"
                  value={customizationFee}
                  onChange={(e) => setCustomizationFee(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#888] uppercase block mb-1">Packaging Box</label>
                <input
                  type="number"
                  value={packagingFee}
                  onChange={(e) => setPackagingFee(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#888] uppercase block mb-1">Delivery Charge</label>
                <input
                  type="number"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E]"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#888] uppercase block mb-1">Discount</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#059669]"
                />
              </div>
            </div>

            {/* Quotation Grand Total */}
            <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EFEAE2] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-serif font-bold uppercase tracking-wider text-[#888] block">
                  Final Quotation Total
                </span>
                <span className="text-2xl font-serif font-bold text-[#E10600]">
                  {formatPrice(quotationTotal)}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveQuotation("draft")}
                  disabled={savingQuote}
                  className="px-4 py-2 rounded-full border border-[#EFEAE2] hover:bg-white text-xs font-serif font-semibold text-[#1E1E1E] transition-colors cursor-pointer"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveQuotation("sent")}
                  disabled={savingQuote}
                  className="px-5 py-2 rounded-full bg-[#1E1E1E] hover:bg-[#E10600] text-white text-xs font-serif font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                >
                  Save & Mark Sent
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Profitability Estimator & Client Coordinates */}
        <div className="space-y-6">
          {/* Profitability Estimator Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-4">
            <h2 className="font-serif text-base font-bold text-[#1E1E1E] flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#E10600]" />
              <span>Profitability Estimator</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-[#888] uppercase block mb-1">
                  Estimated Material Cost (Ribbon, Trunk, Wire)
                </label>
                <input
                  type="number"
                  value={materialCost}
                  onChange={(e) => setMaterialCost(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#888] uppercase block mb-1">
                  Estimated Artisan Labor Cost
                </label>
                <input
                  type="number"
                  value={laborCost}
                  onChange={(e) => setLaborCost(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#EFEAE2] rounded-xl text-[#1E1E1E]"
                />
              </div>

              <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EFEAE2] space-y-2 pt-3">
                <div className="flex justify-between text-[#666]">
                  <span>Total Recorded Cost:</span>
                  <span className="font-mono">{formatPrice(totalCost)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#1E1E1E]">
                  <span>Estimated Gross Profit:</span>
                  <span className="font-serif text-base text-emerald-600">
                    {formatPrice(estimatedGrossProfit)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-xs text-[#E10600]">
                  <span>Gross Margin:</span>
                  <span>{grossMarginPercent}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Client Details */}
          <div className="bg-white p-6 rounded-3xl border border-[#EFEAE2] shadow-xs space-y-3 text-xs">
            <h2 className="font-serif text-base font-bold text-[#1E1E1E] flex items-center gap-2">
              <User className="w-4 h-4 text-[#E10600]" />
              <span>Client Coordinates</span>
            </h2>

            <div>
              <span className="text-[10px] uppercase font-bold text-[#888] block">Client Name</span>
              <p className="font-bold text-sm text-[#1E1E1E]">{custom.customer?.name}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[#888] block">Phone (WhatsApp)</span>
              <a
                href={`https://wa.me/${custom.customer?.phone?.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[#25D366] hover:underline"
              >
                {custom.customer?.phone}
              </a>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[#888] block">Target Delivery</span>
              <p className="font-semibold text-[#1E1E1E]">{custom.desiredDeliveryDate}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
