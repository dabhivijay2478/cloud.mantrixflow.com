"use client";

import { ArrowLeft, CreditCard, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { useBillingPlans } from "@/lib/api/hooks/use-billing";
import { useWorkspaceStore } from "@/lib/stores/workspace-store";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";
import type { BillingPlan } from "@/lib/api/types/billing";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentOrganization } = useWorkspaceStore();
  const organizationId = currentOrganization?.id;

  const subscriptionId = searchParams.get("subscriptionId");
  const planId = searchParams.get("planId");

  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [checkoutData, setCheckoutData] = useState<Record<string, unknown> | null>(null);
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: currentOrganization?.name || "",
    country: "IN",
    address: "",
    useAsPrimary: true,
  });

  const { data: plans } = useBillingPlans();
  const selectedPlan = plans?.find((p: BillingPlan) => p.id === planId);

  // Load checkout data from sessionStorage
  useEffect(() => {
    if (!subscriptionId || !planId || !organizationId) {
      router.push("/workspace/billing");
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
        router.push("/workspace/billing");
      }
    } else {
      // No stored data - redirect back to billing page
      showErrorToast(
        "loadFailed",
        "Checkout",
        "Checkout session not found. Please try again.",
      );
      router.push("/workspace/billing");
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

      // Create Razorpay checkout options for subscription
      const options = {
        key: razorpayKey,
        subscription_id: subscriptionId,
        name: "MantrixFlow",
        description: `${selectedPlan?.name || "Plan"} Subscription`,
        prefill: {
          name: formData.cardholderName,
          email: "", // Will be filled from user data
        },
        theme: {
          color: "#000000",
        },
        handler: function (response: any) {
          // Payment successful - Razorpay will handle the subscription
          showSuccessToast("paymentSuccess", "Payment", "Payment completed successfully");
          router.push("/workspace/billing?success=true");
        },
        modal: {
          ondismiss: function () {
            // User closed the modal
            router.push("/workspace/billing?canceled=true");
          },
        },
      };

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
        <div className="border-b">
          <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex items-center gap-4">
              <Link href="/workspace/billing">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-semibold">Complete Your Purchase</h1>
                <p className="text-sm text-muted-foreground">
                  Secure payment powered by Razorpay
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Payment Form - Left Side */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    <CardTitle>Payment Details</CardTitle>
                  </div>
                  <CardDescription>
                    Please ensure CVC and postal codes match what's on file for your card.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Card Number */}
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
                      <span className="text-xs text-muted-foreground">Accepted cards:</span>
                      <div className="flex gap-1">
                        <span className="text-xs">VISA</span>
                        <span className="text-xs">Mastercard</span>
                        <span className="text-xs">AMEX</span>
                      </div>
                    </div>
                  </div>

                  {/* Expiry and CVV */}
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

                  {/* Cardholder Name */}
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

                  {/* Country */}
                  <div className="space-y-2">
                    <Label htmlFor="country">Country or Region</Label>
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

                  {/* Address */}
                  <div className="space-y-2">
                    <Label htmlFor="address">Billing Address</Label>
                    <Input
                      id="address"
                      placeholder="Street address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  {/* Terms */}
                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      By providing your card information, you allow MantrixFlow to charge your card
                      for future payments in accordance with their terms.
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
