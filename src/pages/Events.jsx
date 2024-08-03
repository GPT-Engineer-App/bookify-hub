import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "../components/PaymentForm";

const stripePromise = loadStripe("your_stripe_publishable_key");

const fetchEvents = async () => {
  // Simulated API call
  return [
    { id: 1, title: "Tech Conference", date: new Date(2024, 5, 15), price: 99.99 },
    { id: 2, title: "Music Festival", date: new Date(2024, 6, 1), price: 149.99 },
    { id: 3, title: "Art Exhibition", date: new Date(2024, 7, 10), price: 19.99 },
    { id: 4, title: "Food & Wine Expo", date: new Date(2024, 8, 5), price: 79.99 },
    { id: 5, title: "Marathon", date: new Date(2024, 9, 20), price: 50.00 },
    { id: 6, title: "Comic Con", date: new Date(2024, 10, 15), price: 89.99 },
    { id: 7, title: "Jazz Night", date: new Date(2024, 11, 1), price: 39.99 },
    { id: 8, title: "Science Fair", date: new Date(2025, 0, 10), price: 15.00 },
    { id: 9, title: "Book Festival", date: new Date(2025, 1, 14), price: 10.00 },
    { id: 10, title: "Career Expo", date: new Date(2025, 2, 22), price: 5.00 },
  ];
};

const Events = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

  const { data: events = [] } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  const filteredEvents = events.filter(
    (event) => format(event.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
  );

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Event Calendar</h1>
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
          <h2 className="text-2xl font-semibold mb-4">
            Events on {format(selectedDate, "MMMM d, yyyy")}
          </h2>
          {filteredEvents.length === 0 ? (
            <p>No events on this date.</p>
          ) : (
            <div className="grid gap-4">
              {filteredEvents.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <CardTitle>{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Date: {format(event.date, "MMMM d, yyyy")}</p>
                    <p>Price: ${event.price.toFixed(2)}</p>
                  </CardContent>
                  <CardFooter>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button onClick={() => setSelectedEvent(event)}>Book Now</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Book {event.title}</DialogTitle>
                        </DialogHeader>
                        <Elements stripe={stripePromise}>
                          <PaymentForm event={selectedEvent} />
                        </Elements>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;
