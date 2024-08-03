import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, addMinutes, parseISO, isSameDay, isSameMonth } from "date-fns";
import { getEvents } from "../utils/eventStorage";
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
  const events = getEvents();
  return events.map(event => ({
    ...event,
    date: event.date ? new Date(event.date) : null,
    time: event.time || null // Ensure time is a string or null
  }));
};

const Events = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

  const { data: events = [], refetch } = useQuery({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  const handleDateSelect = (date) => {
    if (date && (!selectedDate || !isSameDay(date, selectedDate))) {
      setSelectedDate(date);
    }
  };

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'events') {
        refetch();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refetch]);

  const filteredEvents = events.filter(
    (event) => event.date && !isNaN(event.date.getTime()) && isSameDay(event.date, selectedDate)
  );

  const eventDates = useMemo(() => {
    const dates = {};
    events.forEach(event => {
      if (event.date && !isNaN(event.date.getTime())) {
        const dateStr = format(event.date, 'yyyy-MM-dd');
        dates[dateStr] = (dates[dateStr] || 0) + 1;
      }
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
            onSelect={handleDateSelect}
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
                      <p><strong>Date:</strong> {event.date && !isNaN(event.date.getTime()) ? format(event.date, "MMMM d, yyyy") : "N/A"}</p>
                      <p><strong>Time:</strong> {event.time || "N/A"}</p>
                      <p><strong>Duration:</strong> {event.duration ? `${event.duration} minutes` : "N/A"}</p>
                      <p><strong>End Time:</strong> {
                        (() => {
                          try {
                            if (!event.date || !event.time || !event.duration || isNaN(event.date.getTime())) return "N/A";
                            const startDateTime = new Date(event.date);
                            const [hours, minutes] = (event.time || "").split(':');
                            if (!hours || !minutes) return "N/A";
                            startDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));
                            const endTime = addMinutes(startDateTime, event.duration);
                            return !isNaN(endTime.getTime()) ? format(endTime, "HH:mm") : "N/A";
                          } catch (error) {
                            console.error("Error formatting end time:", error);
                            return "N/A";
                          }
                        })()
                      }</p>
                      <p><strong>Price:</strong> ${event.price ? event.price.toFixed(2) : "N/A"}</p>
                      <p><strong>Attendees:</strong> {event.currentAttendees !== undefined && event.maxAttendees !== undefined ? `${event.currentAttendees}/${event.maxAttendees}` : "N/A"}</p>
                      <p className="mt-2"><strong>Description:</strong> {event.description || "N/A"}</p>
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
