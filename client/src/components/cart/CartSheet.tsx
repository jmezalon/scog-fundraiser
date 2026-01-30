import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ShoppingBag, Church } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart } from "@/contexts/CartContext";
import { CartItem } from "./CartItem";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { items, totalItems, totalPrice } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  const handleCheckoutClick = () => {
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = () => {
    setShowCheckout(false);
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Your Cart
            </SheetTitle>
            <SheetDescription>
              {totalItems === 0
                ? "Your cart is empty"
                : `${totalItems} item${totalItems > 1 ? "s" : ""} in your cart`}
            </SheetDescription>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add some hoodies to support our church's building fund!
              </p>
              <div className="flex items-center gap-2 text-amber-600">
                <Church className="w-4 h-4" />
                <span className="text-sm font-medium">God Did It!</span>
              </div>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 -mx-6 px-6">
                <AnimatePresence>
                  {items.map(item => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </AnimatePresence>
              </ScrollArea>

              <div className="border-t border-border pt-4 mt-4 space-y-4">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary">${totalPrice}.00</span>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckoutClick}
                >
                  Proceed to Checkout
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Payment will be collected at pickup
                </p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {showCheckout && (
        <CheckoutForm
          open={showCheckout}
          onOpenChange={setShowCheckout}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </>
  );
}
