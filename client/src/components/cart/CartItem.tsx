import { motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, type CartItem as CartItemType } from "@/contexts/CartContext";
import { HOODIE_COLORS, HOODIE_SIZES } from "@shared/schema";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  const colorInfo = HOODIE_COLORS.find(c => c.value === item.color);
  const sizeInfo = HOODIE_SIZES.find(s => s.value === item.size);

  const itemTotal = item.quantity * item.pricePerUnit;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex gap-4 py-4 border-b border-border last:border-0"
    >
      {/* Color Swatch */}
      <div className="flex-shrink-0">
        <div
          className="w-16 h-16 rounded-md border border-border/50"
          style={{ backgroundColor: colorInfo?.hex || "#000" }}
        />
      </div>

      {/* Item Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-sm">
              {colorInfo?.name || item.color} Hoodie
            </h3>
            <p className="text-sm text-muted-foreground">
              Size: {sizeInfo?.name || item.size}
            </p>
            <p className="text-sm font-medium mt-1">
              ${item.pricePerUnit} each
            </p>
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => removeItem(item.id)}
            aria-label="Remove item"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="text-sm font-medium w-8 text-center">
              {item.quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              disabled={item.quantity >= 10}
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          {/* Item Total */}
          <p className="text-sm font-semibold">
            ${itemTotal}.00
          </p>
        </div>
      </div>
    </motion.div>
  );
}
