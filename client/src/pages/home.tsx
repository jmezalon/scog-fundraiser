import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Minus, Plus, ShoppingBag, ChevronLeft, ChevronRight, Church, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { HOODIE_COLORS, HOODIE_SIZES, HOODIE_PRICE } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import blackHoodie from "@assets/scog-hoodies-black_1769651448789.png";
import redHoodie from "@assets/scog-hoodies-red_1769651461012.png";
import navyHoodie from "@assets/scog-hoodies-navie-blue_1769651469388.png";
import darkGreyHoodie from "@assets/scog-hoodie-gray.png";
import sapphireBlueHoodie from "@assets/scog-hoodie-blue.png";
import purpleHoodie from "@assets/scog-hoodie-purple.png";

const HOODIE_IMAGES: Record<string, string> = {
  "black": blackHoodie,
  "red": redHoodie,
  "navy-blue": navyHoodie,
  "dark-grey": darkGreyHoodie,
  "sapphire-blue": sapphireBlueHoodie,
  "purple": purpleHoodie,
};

const orderFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  color: z.string().min(1, "Please select a color"),
  size: z.string().min(1, "Please select a size"),
  quantity: z.number().min(1).max(10),
});

type OrderFormData = z.infer<typeof orderFormSchema>;

export default function Home() {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [orderComplete, setOrderComplete] = useState(false);
  const { toast } = useToast();

  const availableImages = [blackHoodie, redHoodie, navyHoodie, darkGreyHoodie, sapphireBlueHoodie, purpleHoodie];

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      color: "",
      size: "",
      quantity: 1,
    },
  });

  const selectedColor = form.watch("color");
  const quantity = form.watch("quantity");
  const totalPrice = HOODIE_PRICE * quantity;

  const submitOrder = useMutation({
    mutationFn: async (data: OrderFormData) => {
      const response = await apiRequest("POST", "/api/orders", {
        ...data,
        totalPrice: totalPrice,
      });
      return response;
    },
    onSuccess: () => {
      setOrderComplete(true);
      toast({
        title: "Order Submitted!",
        description: "Thank you for supporting our church's new location.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was a problem submitting your order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OrderFormData) => {
    submitOrder.mutate(data);
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % availableImages.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + availableImages.length) % availableImages.length);
  };

  if (orderComplete) {
    return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6" aria-hidden="true">
            <Check className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }} role="status" aria-live="polite">
            Order Confirmed!
          </h1>
          <p className="text-muted-foreground mb-6">
            Thank you for supporting Salvation Church of God's building fund. We'll contact you soon with pickup details.
          </p>
          <p className="text-2xl font-semibold text-gold mb-8">God Did It!</p>
          <Button
            onClick={() => {
              setOrderComplete(false);
              form.reset();
            }}
            data-testid="button-new-order"
          >
            Place Another Order
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white">
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-64 h-64 bg-amber-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-600 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4"
            >
              <Church className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" />
              <span className="text-amber-400 uppercase tracking-[0.2em] text-[0.7rem] sm:text-sm font-medium">
                Building Fund Fundraiser
              </span>
              <Church className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-3 sm:mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <span className="text-amber-400">Salvation</span> Church of God
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-xl md:text-2xl text-zinc-300 mb-6 max-w-2xl mx-auto"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Official Hoodie Collection
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base"
            >
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="text-amber-200 font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>
                "God Did It!"
              </span>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </motion.div>
          </div>
        </div>
      </header>

      {/* Mission Banner */}
      <section className="bg-primary text-primary-foreground py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <p className="text-sm sm:text-base font-medium">
              All proceeds support our new church location currently under construction
            </p>
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-12 md:py-16">
        <div className="grid lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 min-w-0">
          
          {/* Product Gallery */}
          <div className="space-y-6 min-w-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="overflow-hidden w-full max-w-[420px] sm:max-w-none mx-auto">
                <CardContent className="p-0 relative">
                  <div className="aspect-square bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center p-3 sm:p-8">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={selectedImageIndex}
                        src={selectedColor && HOODIE_IMAGES[selectedColor] ? HOODIE_IMAGES[selectedColor] : availableImages[selectedImageIndex]}
                        alt={`Salvation Church of God official hoodie in ${selectedColor ? HOODIE_COLORS.find(c => c.value === selectedColor)?.name || 'selected color' : ['Black', 'Red', 'Navy Blue'][selectedImageIndex]} - front and back view with gold "God Did It" logo`}
                        className="w-full h-full object-contain max-w-[340px] sm:max-w-none"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        data-testid="img-hoodie-main"
                      />
                    </AnimatePresence>
                  </div>
                  
                  {/* Navigation Arrows */}
                  {!selectedColor && (
                    <div className="absolute inset-x-0 bottom-3 sm:bottom-4 flex items-center justify-between px-4 sm:px-6">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-full opacity-90 h-10 w-10 sm:h-11 sm:w-11"
                        onClick={prevImage}
                        data-testid="button-prev-image"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-full opacity-90 h-10 w-10 sm:h-11 sm:w-11"
                        onClick={nextImage}
                        data-testid="button-next-image"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Thumbnail Gallery */}
              <div className="flex gap-3 justify-start sm:justify-center overflow-x-auto px-1 pb-1 snap-x snap-mandatory max-w-[420px] sm:max-w-none mx-auto overscroll-x-contain">
                {availableImages.map((img, idx) => {
                  const colorNames = ["Black", "Red", "Navy Blue"];
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedImageIndex(idx);
                        form.setValue("color", "");
                      }}
                      aria-label={`View ${colorNames[idx]} hoodie`}
                      className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-all focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 snap-start ${
                        selectedImageIndex === idx && !selectedColor
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border opacity-60 hover:opacity-100"
                      }`}
                      data-testid={`button-thumbnail-${idx}`}
                    >
                      <img
                        src={img}
                        alt={`Salvation Church of God ${colorNames[idx]} hoodie with gold "God Did It" logo`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Product Info */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                <span className="text-4xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>
                  ${HOODIE_PRICE}
                </span>
                <span className="text-muted-foreground">per hoodie</span>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-muted-foreground">
                  Premium quality hoodie featuring the Salvation Church of God logo on the front 
                  with "God Did It!" banner, and full church branding on the back. Available in 
                  6 beautiful colors and sizes from Youth Medium to XXXL.
                </p>
              </div>
            </div>
          </div>

          {/* Order Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="min-w-0"
          >
            <Card className="w-full">
              <CardContent className="p-5 sm:p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <ShoppingBag className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Place Your Order
                  </h2>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Color Selection */}
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Color</FormLabel>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {HOODIE_COLORS.map((color) => (
                              <button
                                key={color.value}
                                type="button"
                                onClick={() => field.onChange(color.value)}
                                aria-label={`Select ${color.name} color`}
                                aria-pressed={field.value === color.value}
                                className={`relative p-3 rounded-md border-2 transition-all flex flex-col items-center gap-2 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                                  field.value === color.value
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                }`}
                                data-testid={`button-color-${color.value}`}
                              >
                                <div
                                  className="w-8 h-8 rounded-full border border-border/50"
                                  style={{ backgroundColor: color.hex }}
                                />
                                <span className="text-xs font-medium text-center">{color.name}</span>
                                {field.value === color.value && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                                  >
                                    <Check className="w-3 h-3 text-primary-foreground" />
                                  </motion.div>
                                )}
                              </button>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Size Selection */}
                    <FormField
                      control={form.control}
                      name="size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Select Size</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-size">
                                <SelectValue placeholder="Choose your size" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {HOODIE_SIZES.map((size) => (
                                <SelectItem 
                                  key={size.value} 
                                  value={size.value}
                                  data-testid={`option-size-${size.value}`}
                                >
                                  {size.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Quantity */}
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <div className="flex items-center gap-4">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => field.onChange(Math.max(1, field.value - 1))}
                              disabled={field.value <= 1}
                              data-testid="button-quantity-decrease"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="text-xl font-semibold w-12 text-center" data-testid="text-quantity">
                              {field.value}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => field.onChange(Math.min(10, field.value + 1))}
                              disabled={field.value >= 10}
                              data-testid="button-quantity-increase"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Contact Information */}
                    <div className="border-t border-border pt-6">
                      <h3 className="font-semibold mb-4">Contact Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} data-testid="input-first-name" />
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
                                <Input placeholder="Doe" {...field} data-testid="input-last-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
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
                              data-testid="input-email"
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
                              data-testid="input-phone"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Order Summary */}
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal ({quantity} item{quantity > 1 ? "s" : ""})</span>
                        <span>${totalPrice}.00</span>
                      </div>
                      <div className="border-t border-border my-2" />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span className="text-primary" data-testid="text-total-price">${totalPrice}.00</span>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={submitOrder.isPending}
                      data-testid="button-submit-order"
                    >
                      {submitOrder.isPending ? (
                        <span className="flex items-center gap-2">
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="block w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                          />
                          Processing...
                        </span>
                      ) : (
                        "Submit Order"
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Payment will be collected at pickup. We'll contact you with pickup details.
                    </p>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-900 text-white py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-2">
          <h3 className="text-xl sm:text-2xl font-bold text-amber-400" style={{ fontFamily: "'Playfair Display', serif" }}>
            Salvation Church of God
          </h3>
          <a
            href="https://salvation-church-puce.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-300 hover:underline break-words inline-block"
          >
            www.salvationchurchofgod.com
          </a>
          <p className="text-amber-300 font-medium" style={{ fontFamily: "'Playfair Display', serif" }}>
            "God Did It!"
          </p>
        </div>
      </footer>
    </div>
  );
}
