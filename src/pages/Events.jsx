import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, addMinutes, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { getEvents } from "../utils/eventStorage";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "../components/PaymentForm";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar as CalendarIcon, Clock, Users } from "lucide-react";

const stripePromise = loadStripe("your_stripe_publishable_key");

const fetchEvents = async () => {
  const events = getEvents();
  return events.map(event => ({
    ...event,
    date: event.date ? new Date(event.date) : null,
    time: event.time || null
  }));
};

const Events = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleFormChange = useCallback((isDirty) => {
    setIsFormDirty(isDirty);
  }, []);

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
    (event) => 
      event.date && 
      !isNaN(event.date.getTime()) && 
      isSameDay(event.date, selectedDate) &&
      (event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       event.description.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const monthEvents = useMemo(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    const days = eachDayOfInterval({ start, end });
    return days.map(day => ({
      date: day,
      events: events.filter(event => event.date && isSameDay(event.date, day))
    }));
  }, [selectedDate, events]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-800">Event Calendar</h1>
      <div className="mb-6">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-lg border shadow-lg"
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
                        isSelected ? "bg-blue-600 text-white rounded-full" : (eventCount > 0 ? "text-blue-600" : undefined)
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
                              isSelected ? "bg-white" : "bg-blue-500"
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
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Upcoming Events</h3>
            <div className="space-y-4">
              {monthEvents.slice(0, 5).map(({ date, events }) => (
                <div key={date.toISOString()} className="flex items-center">
                  <div className="w-16 text-center">
                    <div className="text-sm font-semibold">{format(date, 'MMM')}</div>
                    <div className="text-2xl font-bold">{format(date, 'd')}</div>
                  </div>
                  <div className="ml-4 flex-grow">
                    {events.length > 0 ? (
                      events.map(event => (
                        <div key={event.id} className="text-sm">
                          {event.title}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">No events</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:w-2/3">
          <h2 className="text-2xl font-semibold mb-6">
            Events on {format(selectedDate, "MMMM d, yyyy")}
          </h2>
          {filteredEvents.length === 0 ? (
            <p className="text-center text-gray-500">No events on this date.</p>
          ) : (
            <div className="grid gap-6">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      <img src={event.imageUrl} alt={event.title} className="w-full h-48 md:h-full object-cover" />
                    </div>
                    <div className="md:w-2/3 p-6">
                      <CardHeader className="p-0">
                        <CardTitle className="text-2xl font-bold text-blue-800">{event.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center">
                            <CalendarIcon className="w-5 h-5 mr-2 text-blue-600" />
                            <span>{event.date && !isNaN(event.date.getTime()) ? format(event.date, "MMMM d, yyyy") : "N/A"}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-blue-600" />
                            <span>{event.time || "N/A"}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                            <span>{event.location || "N/A"}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-5 h-5 mr-2 text-blue-600" />
                            <span>{event.currentAttendees !== undefined && event.maxAttendees !== undefined ? `${event.currentAttendees}/${event.maxAttendees} attendees` : "N/A"}</span>
                          </div>
                        </div>
                        <p className="mt-4 text-gray-600">{event.description || "N/A"}</p>
                      </CardContent>
                      <CardFooter className="p-0 mt-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button onClick={() => setSelectedEvent(event)} className="w-full">Book Now - ${event.price ? event.price.toFixed(2) : "N/A"}</Button>
                          </DialogTrigger>
                          <DialogContent closeOnOutsideClick={!isFormDirty}>
                            <DialogHeader>
                              <DialogTitle>Book {event.title}</DialogTitle>
                            </DialogHeader>
                            <Elements stripe={stripePromise}>
                              <PaymentForm event={selectedEvent} onFormChange={handleFormChange} />
                            </Elements>
                          </DialogContent>
                        </Dialog>
                      </CardFooter>
                    </div>
                  </div>
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
