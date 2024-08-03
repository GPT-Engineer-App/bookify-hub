import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, addMinutes, parseISO, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "../components/PaymentForm";

const stripePromise = loadStripe("your_stripe_publishable_key");

const fetchEvents = async () => {
  // Simulated API call
  return [
    {
      id: 1,
      title: "Tech Conference",
      date: new Date(2024, 5, 15),
      time: "09:00",
      duration: 480,
      price: 99.99,
      maxAttendees: 500,
      currentAttendees: 350,
      description: "A conference showcasing the latest in technology trends and innovations.",
      imageUrl: "https://example.com/tech-conference.jpg"
    },
    {
      id: 2,
      title: "Music Festival",
      date: new Date(2024, 6, 1),
      time: "14:00",
      duration: 360,
      price: 149.99,
      maxAttendees: 10000,
      currentAttendees: 8500,
      description: "A day-long music festival featuring top artists from around the world.",
      imageUrl: "https://example.com/music-festival.jpg"
    },
    // ... add more events with the new structure
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

  const eventDates = useMemo(() => events.map(event => event.date), [events]);

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
            modifiers={{ hasEvent: eventDates }}
            modifiersStyles={{
              hasEvent: { backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }
            }}
            components={{
              DayContent: ({ date, ...props }) => (
                <div
                  {...props}
                  className={cn(
                    props.className,
                    events.some(event => isSameDay(date, event.date)) && "bg-accent text-accent-foreground rounded-full"
                  )}
                >
                  {date.getDate()}
                </div>
              ),
            }}
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
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <img src={event.imageUrl} alt={event.title} className="w-full h-48 object-cover rounded-md" />
                    </div>
                    <div>
                      <p><strong>Date:</strong> {format(event.date, "MMMM d, yyyy")}</p>
                      <p><strong>Time:</strong> {event.time}</p>
                      <p><strong>Duration:</strong> {event.duration} minutes</p>
                      <p><strong>End Time:</strong> {
                        (() => {
                          try {
                            const startDateTime = new Date(event.date);
                            const [hours, minutes] = event.time.split(':');
                            startDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));
                            return format(addMinutes(startDateTime, event.duration), "HH:mm");
                          } catch (error) {
                            console.error("Error formatting end time:", error);
                            return "N/A";
                          }
                        })()
                      }</p>
                      <p><strong>Price:</strong> ${event.price.toFixed(2)}</p>
                      <p><strong>Attendees:</strong> {event.currentAttendees}/{event.maxAttendees}</p>
                      <p className="mt-2"><strong>Description:</strong> {event.description}</p>
                    </div>
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
