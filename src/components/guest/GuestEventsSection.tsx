import { MapPin, Calendar, Clock, ArrowUpRight } from 'lucide-react';
import { AspectRatio } from '../ui/aspect-ratio';

interface Event {
  id: string;
  title: string;
  date: Date | string;
  time: string;
  location: string;
  address: string;
}

interface EventsSectionProps {
  events: Event[];
  primaryColor?: string;
  secondaryColor?: string;
  headingFont?: string;
  bodyFont?: string;
}

export function GuestEventsSection({
  events,
  primaryColor = '#e4b6c6',
  secondaryColor = '#d4a5a5',
  headingFont = 'Playfair Display',
  bodyFont = 'Lato',
}: EventsSectionProps) {
  if (!events || events.length === 0) return null;

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <section
      className="guest-section guest-events"
      style={{
        fontFamily: bodyFont,
      }}
    >
      <div className="guest-inner">
        <p className="guest-kicker">The itinerary</p>
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 sm:mb-16"
          style={{
            fontFamily: headingFont,
            color: '#333',
          }}
        >
          When & Where
        </h2>

        <div className="guest-event-list">
          {events.map((event, index) => (
            <div
              key={event.id || index}
              className="guest-event"
            >
              <div
                className="guest-event-details"
              >
                <span className="guest-kicker">{String(index + 1).padStart(2, '0')}</span>
                {/* Event Title */}
                <h3
                  className="text-2xl sm:text-3xl font-bold mb-6"
                  style={{
                    fontFamily: headingFont,
                    color: '#293d37',
                  }}
                >
                  {event.title}
                </h3>

                <div className="space-y-4">
                  {/* Date */}
                  <div className="flex items-start gap-3">
                    <Calendar
                      className="w-5 h-5 mt-1 shrink-0"
                      style={{ color: primaryColor }}
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatDate(event.date)}
                      </p>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-start gap-3">
                    <Clock
                      className="w-5 h-5 mt-1 shrink-0"
                      style={{ color: primaryColor }}
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {event.time}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <MapPin
                      className="w-5 h-5 mt-1 shrink-0"
                      style={{ color: primaryColor }}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-1">
                        {event.location}
                      </p>
                      <p className="guest-event-address">{event.address}</p>
                      {event.address && <a className="guest-map-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)}`} target="_blank" rel="noopener noreferrer">Get directions <ArrowUpRight size={14} aria-hidden="true" /></a>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Embedded Map */}
              {event.address && <AspectRatio ratio={16 / 9}>
                <iframe
                  src={`https://www.google.com/maps?q=${encodeURIComponent(event.address)}&output=embed`}
                  className="w-full h-full"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Map for ${event.title}`}
                />
              </AspectRatio>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
