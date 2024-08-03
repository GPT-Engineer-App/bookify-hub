import { useState, useEffect } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  personnummer: z.string().regex(/^\d{12}$/, "Personnummer must be 12 digits"),
  favoriteAnimal: z.string().min(1, "Favorite animal is required").refine(value => value.toLowerCase() !== 'zebra', {
    message: "Sorry, zebra lovers can't book events",
  }),
});

const PaymentForm = ({ event, onFormChange }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      personnummer: "",
      favoriteAnimal: "",
    },
  });

  const formValues = useWatch({ control: form.control });

  useEffect(() => {
    const isFormEmpty = Object.values(formValues).every(value => value === "" || value === undefined);
    onFormChange(!isFormEmpty);
  }, [formValues, onFormChange]);

  const onSubmit = async (data) => {
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
      console.log("Form data", data);
      // Here you would typically send the paymentMethod.id and form data to your server
      // to complete the payment and store the user information
      alert("Booking successful!");
      setProcessing(false);
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <h3 className="font-semibold">{event.title}</h3>
          <p>Price: ${event.price.toFixed(2)}</p>
        </div>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="personnummer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Personnummer</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="favoriteAnimal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Favorite Animal</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="border p-3 rounded">
          <CardElement />
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <Button type="submit" disabled={!stripe || processing}>
          {processing ? "Processing..." : "Book Now"}
        </Button>
      </form>
    </Form>
  );
};

export default PaymentForm;
