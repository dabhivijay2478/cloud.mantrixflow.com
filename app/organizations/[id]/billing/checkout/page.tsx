"use client";

import { ArrowLeft, CreditCard, Loader2, Lock, Smartphone } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBillingPlans } from "@/lib/api/hooks/use-billing";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";
import type { BillingPlan } from "@/lib/api/types/billing";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function OrganizationCheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const organizationId = params.id as string;

  const subscriptionId = searchParams.get("subscriptionId");
  const planId = searchParams.get("planId");

  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [checkoutData, setCheckoutData] = useState<Record<string, unknown> | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi">("card");
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    country: "IN",
    address: "",
    upiId: "",
  });

  const { data: plans } = useBillingPlans();
  const selectedPlan = plans?.find((p: BillingPlan) => p.id === planId);

  // Load checkout data from sessionStorage
  useEffect(() => {
    if (!subscriptionId || !planId || !organizationId) {
      router.push(`/organizations/${organizationId}/billing`);
      return;
    }

    // Get checkout data from sessionStorage (stored by billing page)
    const storedCheckoutData = sessionStorage.getItem(`checkout_${subscriptionId}`);
    if (storedCheckoutData) {
      try {
        const parsed = JSON.parse(storedCheckoutData);
        setCheckoutData(parsed);
      } catch (error) {
        console.error("Error parsing checkout data:", error);
        showErrorToast(
          "loadFailed",
          "Checkout",
          "Failed to load checkout data. Please try again from billing page.",
        );
        router.push(`/organizations/${organizationId}/billing`);
      }
    } else {
      // No stored data - redirect back to billing page
      showErrorToast(
        "loadFailed",
        "Checkout",
        "Checkout session not found. Please try again.",
      );
      router.push(`/organizations/${organizationId}/billing`);
    }
  }, [subscriptionId, planId, organizationId, router]);

  // Handle Razorpay checkout
  const handleCheckout = async () => {
    if (!subscriptionId || !razorpayLoaded || !window.Razorpay) {
      showErrorToast("loadFailed", "Payment", "Payment gateway not ready");
      return;
    }

    if (!checkoutData) {
      showErrorToast("loadFailed", "Payment", "Checkout data not available");
      return;
    }

    setIsProcessing(true);

    try {
      // Get Razorpay key from checkout data (provided by backend)
      const razorpayKey = checkoutData.keyId as string;

      if (!razorpayKey) {
        throw new Error(
          "Razorpay key not available. Please ensure checkout session was created successfully.",
        );
      }

      // Configure Razorpay options for subscription with multiple payment methods
      const options: any = {
        key: razorpayKey,
        subscription_id: subscriptionId,
        name: "MantrixFlow",
        description: `${selectedPlan?.name || "Plan"} Subscription`,
        prefill: {
          name: formData.cardholderName || "",
          email: "", // Will be filled from user data
        },
        theme: {
          color: "#000000",
        },
        // Enable multiple payment methods
        method: {
          card: true, // Indian and International cards
          upi: true, // UPI payments
          netbanking: true, // Net banking
          wallet: true, // Wallets (Paytm, etc.)
        },
        handler: function (response: any) {
          // Payment successful - Razorpay will handle the subscription
          showSuccessToast("paymentSuccess", "Payment", "Payment completed successfully");
          router.push(`/organizations/${organizationId}/billing?success=true`);
        },
        modal: {
          ondismiss: function () {
            // User closed the modal
            router.push(`/organizations/${organizationId}/billing?canceled=true`);
          },
        },
      };

      // If UPI is selected, add UPI ID
      if (paymentMethod === "upi" && formData.upiId) {
        options.prefill.contact = formData.upiId;
      }

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      showErrorToast(
        "loadFailed",
        "Payment",
        error instanceof Error ? error.message : "Failed to initialize payment",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount === 0) return "Free";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!subscriptionId || !planId || !selectedPlan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      {/* Load Razorpay Checkout Script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => showErrorToast("loadFailed", "Payment", "Failed to load payment gateway")}
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex items-center gap-4">
              <Link href={`/organizations/${organizationId}/billing`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-semibold">Complete Your Purchase</h1>
                <p className="text-sm text-muted-foreground">
                  Secure payment powered by Razorpay - Cards, UPI & More
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-7xl pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Payment Form - Left Side */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    <CardTitle>Payment Method</CardTitle>
                  </div>
                  <CardDescription>
                    Choose your preferred payment method. All methods are secure.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "card" | "upi")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="card">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Card
                      </TabsTrigger>
                      <TabsTrigger value="upi">
                        <Smartphone className="h-4 w-4 mr-2" />
                        UPI
                      </TabsTrigger>
                    </TabsList>

                    {/* Card Payment */}
                    <TabsContent value="card" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 1234 1234 1234"
                          value={formData.cardNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, cardNumber: e.target.value })
                          }
                          maxLength={19}
                        />
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">Accepted:</span>
                          <div className="flex gap-1">
                            <span className="text-xs">VISA</span>
                            <span className="text-xs">Mastercard</span>
                            <span className="text-xs">RuPay</span>
                            <span className="text-xs">AMEX</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM / YY"
                            value={formData.expiryDate}
                            onChange={(e) =>
                              setFormData({ ...formData, expiryDate: e.target.value })
                            }
                            maxLength={5}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">Security Code</Label>
                          <Input
                            id="cvv"
                            placeholder="CVC"
                            type="password"
                            value={formData.cvv}
                            onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                            maxLength={4}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardholderName">Cardholder Name</Label>
                        <Input
                          id="cardholderName"
                          placeholder="Full name"
                          value={formData.cardholderName}
                          onChange={(e) =>
                            setFormData({ ...formData, cardholderName: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Select
                          value={formData.country}
                          onValueChange={(value) => setFormData({ ...formData, country: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IN">India</SelectItem>
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="GB">United Kingdom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>

                    {/* UPI Payment */}
                    <TabsContent value="upi" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="upiId">UPI ID</Label>
                        <Input
                          id="upiId"
                          placeholder="yourname@paytm / yourname@phonepe / yourname@googlepay"
                          value={formData.upiId}
                          onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter your UPI ID (e.g., yourname@paytm, yourname@phonepe)
                        </p>
                      </div>

                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm font-medium mb-2">Supported UPI Apps:</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">Google Pay</Badge>
                          <Badge variant="outline">PhonePe</Badge>
                          <Badge variant="outline">Paytm</Badge>
                          <Badge variant="outline">BHIM</Badge>
                          <Badge variant="outline">Amazon Pay</Badge>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Terms */}
                  <div className="pt-4 border-t mt-4">
                    <p className="text-xs text-muted-foreground">
                      By proceeding, you allow MantrixFlow to charge your payment method for
                      future payments in accordance with their terms. All payments are processed
                      securely by Razorpay.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary - Right Side */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  <CardDescription>{selectedPlan.name} Plan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Plan Details */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Plan</span>
                      <span className="text-sm font-medium">{selectedPlan.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Billing</span>
                      <span className="text-sm font-medium">Monthly</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total</span>
                      <span className="text-2xl font-bold">
                        {formatCurrency(selectedPlan.pricing.month)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Charged monthly until cancelled
                    </p>
                  </div>

                  {/* Features */}
                  <div className="border-t pt-4 space-y-2">
                    <p className="text-sm font-medium">What's included:</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {selectedPlan.features.slice(0, 5).map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary">✓</span>
                          <span>
                            {feature.label}: {feature.value}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Confirm Button */}
                  <Button
                    className="w-full mt-6"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={isProcessing || !razorpayLoaded || !checkoutData}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : !checkoutData ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Confirm Payment
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Secure payment by Razorpay
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
