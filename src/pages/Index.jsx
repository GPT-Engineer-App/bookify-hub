import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, Users, MapPin, Star } from "lucide-react";
import EventRecommendations from "../components/EventRecommendations";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-white">
      <div className="text-center max-w-5xl px-4 py-12">
        <h1 className="text-6xl font-bold mb-6 text-blue-800">Welcome to Event Booker</h1>
        <p className="text-2xl text-gray-700 mb-10">Discover, book, and experience exciting events in your area!</p>
        <div className="flex justify-center space-x-4 mb-12">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link to="/events">Browse Events</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/admin">Create Event</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left mb-12">
          <FeatureCard
            icon={<Calendar className="w-8 h-8 text-blue-500" />}
            title="Easy Booking"
            description="Browse and book events with just a few clicks."
          />
          <FeatureCard
            icon={<Users className="w-8 h-8 text-blue-500" />}
            title="Connect with Others"
            description="Meet like-minded people at exciting events."
          />
          <FeatureCard
            icon={<MapPin className="w-8 h-8 text-blue-500" />}
            title="Local Experiences"
            description="Discover unique events in your area."
          />
          <FeatureCard
            icon={<Star className="w-8 h-8 text-blue-500" />}
            title="Personalized Recommendations"
            description="Get event suggestions tailored to your interests."
          />
        </div>
        <EventRecommendations />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
    {icon}
    <h3 className="text-xl font-semibold mt-4 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default Index;
