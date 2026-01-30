import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { CartSheet } from "./CartSheet";

export function CartButton() {
  const { totalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <motion.div
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          size="lg"
          className="relative h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => setIsCartOpen(true)}
          aria-label={`Shopping cart with ${totalItems} items`}
        >
          <ShoppingBag className="w-6 h-6" />

          <AnimatePresence>
            {totalItems > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-background"
              >
                {totalItems > 9 ? "9+" : totalItems}
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      <CartSheet open={isCartOpen} onOpenChange={setIsCartOpen} />
    </>
  );
}
