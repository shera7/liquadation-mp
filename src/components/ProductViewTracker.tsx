"use client";

import { useEffect } from "react";
import { trackViewProduct } from "@/lib/trackConversion";

export default function ProductViewTracker({
  id,
  title,
  price,
  currency,
}: {
  id: string;
  title: string;
  price: number | null;
  currency: string;
}) {
  useEffect(() => {
    trackViewProduct({ id, title, price, currency });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return null;
}
