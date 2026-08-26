import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ListingCard } from "@/components/ListingCard";
import { SlotListing } from "@/data/mock-slots";

const MOCK_SLOT_ITEM: SlotListing = {
  id: "slot-card-1",
  slotNumber: "SLOT #001",
  title: "Premium Tech Backpack",
  description: "Ergonomic waterproof backpack",
  category: "Tactical Tech & EDC",
  price: 3499,
  compareAtPrice: 4999,
  currencyCode: "INR",
  inventoryQuantity: 8,
  status: "AVAILABLE",
  shopifyProductId: "prod-1",
  shopifyVariantId: "var-1",
  merchant: {
    id: "m-1",
    name: "Apex Gear",
    myshopifyDomain: "apex-gear.myshopify.com",
    storeLogo: "",
    status: "ACTIVE",
    totalProducts: 5,
    connectedSince: "2026-01-01",
    lastWebhookSync: "Just now",
  },
  tags: ["backpack", "edc"],
  images: ["https://example.com/backpack1.jpg", "https://example.com/backpack2.jpg"],
  sku: "APEX-BP-01",
  createdAt: "2026-01-01",
  variants: [],
  syncLogs: [],
};

describe("ListingCard Component", () => {
  it("renders product title, merchant name, category, and formatted price", () => {
    render(<ListingCard slot={MOCK_SLOT_ITEM} />);

    expect(screen.getByText("Premium Tech Backpack")).toBeInTheDocument();
    expect(screen.getByText("Apex Gear")).toBeInTheDocument();
    expect(screen.getByText("Tactical Tech & EDC")).toBeInTheDocument();

    // Price checks
    expect(screen.getByText(/3,499/)).toBeInTheDocument();
    expect(screen.getByText(/4,999/)).toBeInTheDocument();
    // Discount percentage: (4999 - 3499) / 4999 ~ 30%
    expect(screen.getByText("30% OFF")).toBeInTheDocument();
  });

  it("renders SOLD OUT badge when out of stock", () => {
    const outOfStockSlot: SlotListing = {
      ...MOCK_SLOT_ITEM,
      inventoryQuantity: 0,
      status: "SOLD",
    };

    render(<ListingCard slot={outOfStockSlot} />);
    expect(screen.getByText("SOLD OUT")).toBeInTheDocument();
  });

  it("calls onSelect callback when Quick View button is clicked", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();

    render(<ListingCard slot={MOCK_SLOT_ITEM} onSelect={handleSelect} />);

    const quickViewBtn = screen.getByRole("button", { name: /quick view/i });
    await user.click(quickViewBtn);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(MOCK_SLOT_ITEM);
  });
});
