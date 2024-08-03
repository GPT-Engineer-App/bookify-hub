import { useQuery } from "@tanstack/react-query";
import { getEvents } from "../utils/eventStorage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const fetchRecommendedEvents = async () => {
  const events = getEvents();
  // This is a simple recommendation algorithm. In a real app, you'd use more sophisticated methods.
  return events
    .sort((a, b) => b.currentAttendees / b.maxAttendees - a.currentAttendees / a.maxAttendees)
    .slice(0, 3);
};

const EventRecommendations = () => {
  const { data: recommendedEvents = [] } = useQuery({
    queryKey: ["recommendedEvents"],
    queryFn: fetchRecommendedEvents,
  });

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Recommended Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendedEvents.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-lg">{event.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <img src={event.imageUrl} alt={event.title} className="w-full h-40 object-cover mb-4 rounded" />
              <p className="text-sm text-gray-600 mb-2">
                {format(new Date(event.date), "MMMM d, yyyy")} at {event.time}
              </p>
              <p className="text-sm mb-4">{event.description.slice(0, 100)}...</p>
              <Button className="w-full">Learn More</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EventRecommendations;
