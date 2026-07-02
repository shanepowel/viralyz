import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "paypal-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

interface SubscriptionPayPalProps {
  planId: "pro" | "team";
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function SubscriptionPayPal({
  planId,
  onSuccess,
  onCancel,
}: SubscriptionPayPalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const buttonId = `paypal-button-${planId}`;

  const createOrder = async () => {
    const response = await fetch("/paypal/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create order");
    }
    
    const output = await response.json();
    return { orderId: output.id };
  };

  const captureOrder = async (orderId: string) => {
    const response = await fetch(`/paypal/order/${orderId}/capture`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    return data;
  };

  const handleApprove = async (data: any) => {
    try {
      const orderData = await captureOrder(data.orderId);
      
      if (orderData.planUpgrade?.success) {
        toast({
          title: "Upgrade Successful!",
          description: orderData.planUpgrade.message,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        onSuccess?.();
      } else if (orderData.status === "COMPLETED") {
        toast({
          title: "Payment Completed",
          description: "Your subscription has been updated.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        onSuccess?.();
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "Failed to complete payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = async () => {
    toast({
      title: "Payment Cancelled",
      description: "Your payment was cancelled.",
    });
    onCancel?.();
  };

  const handleError = async (error: any) => {
    console.error("PayPal error:", error);
    toast({
      title: "Payment Error",
      description: "Something went wrong. Please try again.",
      variant: "destructive",
    });
  };

  useEffect(() => {
    const loadPayPalSDK = async () => {
      try {
        if (!(window as any).paypal) {
          const script = document.createElement("script");
          script.src = import.meta.env.PROD
            ? "https://www.paypal.com/web-sdk/v6/core"
            : "https://www.sandbox.paypal.com/web-sdk/v6/core";
          script.async = true;
          script.onload = () => initPayPal();
          document.body.appendChild(script);
        } else {
          await initPayPal();
        }
      } catch (e) {
        console.error("Failed to load PayPal SDK", e);
        setIsLoading(false);
      }
    };

    loadPayPalSDK();
  }, [planId]);

  const initPayPal = async () => {
    try {
      const clientToken: string = await fetch("/paypal/setup")
        .then((res) => res.json())
        .then((data) => data.clientToken);

      const sdkInstance = await (window as any).paypal.createInstance({
        clientToken,
        components: ["paypal-payments"],
      });

      const paypalCheckout = sdkInstance.createPayPalOneTimePaymentSession({
        onApprove: handleApprove,
        onCancel: handleCancel,
        onError: handleError,
      });

      const onClick = async () => {
        try {
          const checkoutOptionsPromise = createOrder();
          await paypalCheckout.start(
            { paymentFlow: "auto" },
            checkoutOptionsPromise,
          );
        } catch (e) {
          console.error(e);
          handleError(e);
        }
      };

      const paypalButton = document.getElementById(buttonId);
      if (paypalButton) {
        paypalButton.addEventListener("click", onClick);
        setIsLoading(false);
      }

      return () => {
        if (paypalButton) {
          paypalButton.removeEventListener("click", onClick);
        }
      };
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  return (
    <div 
      id={buttonId} 
      className={`paypal-button cursor-pointer inline-flex items-center justify-center w-full px-6 py-3 bg-[#0070ba] hover:bg-[#003087] text-white font-semibold rounded-lg transition-colors ${isLoading ? 'opacity-50' : ''}`}
      data-testid={`paypal-button-${planId}`}
    >
      {isLoading ? "Loading PayPal..." : "Pay with PayPal"}
    </div>
  );
}
