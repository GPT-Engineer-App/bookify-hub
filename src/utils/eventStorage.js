const EVENTS_STORAGE_KEY = 'events';

export const getEvents = () => {
  const eventsJson = localStorage.getItem(EVENTS_STORAGE_KEY);
  return eventsJson ? JSON.parse(eventsJson) : [];
};

export const saveEvent = (event) => {
  const events = getEvents();
  const newEvent = { ...event, id: Date.now() };
  events.push(newEvent);
  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  return newEvent;
};

export const clearEvents = () => {
  localStorage.removeItem(EVENTS_STORAGE_KEY);
};
