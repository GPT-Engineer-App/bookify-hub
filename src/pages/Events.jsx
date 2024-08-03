import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, addMinutes, parseISO, isSameDay, isSameMonth } from "date-fns";
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
    {
      id: 3,
      title: "Art Exhibition",
      date: new Date(2024, 6, 1),
      time: "10:00",
      duration: 240,
      price: 15.00,
      maxAttendees: 200,
      currentAttendees: 75,
      description: "An exhibition showcasing works from local and international artists.",
      imageUrl: "https://example.com/art-exhibition.jpg"
    },
    // ... add more events if needed
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
    (event) => isSameDay(event.date, selectedDate)
  );

  const eventDates = useMemo(() => {
    const dates = {};
    events.forEach(event => {
      const dateStr = format(event.date, 'yyyy-MM-dd');
      dates[dateStr] = (dates[dateStr] || 0) + 1;
    });
    return dates;
  }, [events]);

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
            components={{
              DayContent: ({ date, ...props }) => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const eventCount = eventDates[dateStr] || 0;
                const isSelected = isSameDay(date, selectedDate);
                return (
                  <div className="relative w-full h-full">
                    <div
                      {...props}
                      className={cn(
                        props.className,
                        "w-full h-full flex items-center justify-center",
                        eventCount > 0 && "font-bold",
                        isSelected ? "text-white" : (eventCount > 0 ? "text-primary" : undefined)
                      )}
                    >
                      {date.getDate()}
                    </div>
                    {eventCount > 0 && (
                      <div className="absolute bottom-1 left-0 right-0 flex justify-center">
                        {[...Array(Math.min(eventCount, 3))].map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "w-1 h-1 rounded-full mx-0.5",
                              isSelected ? "bg-white" : "bg-red-500"
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              },
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
