import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";

const PaymentForm = ({ event }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement),
    });

    if (error) {
      setError(error.message);
      setProcessing(false);
    } else {
      console.log("PaymentMethod", paymentMethod);
      // Here you would typically send the paymentMethod.id to your server
      // to complete the payment
      alert("Payment successful!");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="font-semibold">{event.title}</h3>
        <p>Price: ${event.price.toFixed(2)}</p>
      </div>
      <div className="border p-3 rounded">
        <CardElement />
      </div>
      {error && <div className="text-red-500">{error}</div>}
      <Button type="submit" disabled={!stripe || processing}>
        {processing ? "Processing..." : "Pay Now"}
      </Button>
    </form>
  );
};

export default PaymentForm;
