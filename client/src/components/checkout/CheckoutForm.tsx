import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, CreditCard, ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { apiRequest } from "@/lib/queryClient";
import { HOODIE_COLORS, HOODIE_SIZES } from "@shared/schema";
import { StripeProvider } from "./StripeProvider";
import { PaymentForm } from "./PaymentForm";

interface CheckoutFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const checkoutFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
});

type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

type CheckoutStep = "info" | "payment" | "success";

export function CheckoutForm({ open, onOpenChange, onSuccess }: CheckoutFormProps) {
  const { items, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [step, setStep] = useState<CheckoutStep>("info");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CheckoutFormData | null>(null);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  });

  const createPaymentIntent = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        items: items.map(item => ({
          color: item.color,
          size: item.size,
          quantity: item.quantity,
          pricePerUnit: item.pricePerUnit,
        })),
        customerInfo: data,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
      setStep("payment");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const confirmPayment = useMutation({
    mutationFn: async () => {
      if (!paymentIntentId) throw new Error("No payment intent");
      const response = await apiRequest("POST", "/api/confirm-payment", {
        paymentIntentId,
      });
      return response.json();
    },
    onSuccess: () => {
      clearCart();
      setStep("success");
      toast({
        title: "Order Submitted!",
        description: "Thank you for supporting our church's building fund.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to confirm order. Please contact support.",
        variant: "destructive",
      });
    },
  });

  const onSubmitInfo = (data: CheckoutFormData) => {
    setCustomerInfo(data);
    createPaymentIntent.mutate(data);
  };

  const handlePaymentSuccess = () => {
    confirmPayment.mutate();
  };

  const handleBack = () => {
    setStep("info");
    setClientSecret(null);
  };

  const handleClose = () => {
    if (step === "success") {
      form.reset();
      setStep("info");
      setClientSecret(null);
      setPaymentIntentId(null);
      setCustomerInfo(null);
      onSuccess();
    }
    onOpenChange(false);
  };

  // Success state
  if (step === "success") {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              Payment Successful!
            </h2>
            <p className="text-muted-foreground mb-4">
              Thank you for supporting Salvation Church of God's building fund. We'll contact you soon with pickup details.
            </p>
            <p className="text-xl font-semibold text-amber-600 mb-6">
              God Did It!
            </p>
            <Button onClick={handleClose}>
              Close
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "'Playfair Display', serif" }}>
            {step === "info" ? "Complete Your Order" : "Payment"}
          </DialogTitle>
          <DialogDescription>
            {step === "info"
              ? "Enter your contact information to proceed to payment."
              : "Choose your preferred payment method."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold">Order Summary</h3>
              {items.map(item => {
                const colorInfo = HOODIE_COLORS.find(c => c.value === item.color);
                const sizeInfo = HOODIE_SIZES.find(s => s.value === item.size);
                return (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {colorInfo?.name} - {sizeInfo?.name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      ${item.quantity * item.pricePerUnit}.00
                    </span>
                  </div>
                );
              })}
              <div className="border-t border-border pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">${totalPrice}.00</span>
              </div>
            </div>

            {/* Step: Contact Info */}
            {step === "info" && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitInfo)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="(555) 123-4567"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => onOpenChange(false)}
                      disabled={createPaymentIntent.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={createPaymentIntent.isPending}
                    >
                      {createPaymentIntent.isPending ? (
                        <span className="flex items-center gap-2">
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="block w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                          />
                          Loading...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          Proceed to Payment
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {/* Step: Payment */}
            {step === "payment" && clientSecret && (
              <StripeProvider clientSecret={clientSecret}>
                <PaymentForm
                  amount={totalPrice}
                  onSuccess={handlePaymentSuccess}
                  onBack={handleBack}
                />
              </StripeProvider>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
