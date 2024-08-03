import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  price: z.number().min(0, "Price must be a positive number"),
});

const Admin = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      price: 0,
    },
  });

  const onSubmit = (data) => {
    const event = {
      ...data,
      date: selectedDate,
    };
    console.log("New event:", event);
    // Here you would typically send this data to your backend API
    form.reset();
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
        </div>
        <div className="md:w-2/3">
          <h2 className="text-2xl font-semibold mb-4">Create New Event</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <FormLabel>Date</FormLabel>
                <p>{format(selectedDate, "MMMM d, yyyy")}</p>
              </div>
              <Button type="submit">Create Event</Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Admin;
