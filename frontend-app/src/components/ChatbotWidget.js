import React from 'react';
import './ChatbotWidget.css';

const starterQuestions = [
  'How do I book a seat?',
  'How do I pay within 24 hours?',
  'How can theatre users send alerts?',
  'Show events in PVR or nearby cinema areas',
];

const stopWords = new Set([
  'the', 'and', 'for', 'with', 'from', 'this', 'that', 'have', 'there', 'where',
  'what', 'when', 'will', 'show', 'open', 'please', 'near', 'nearby', 'any',
  'all', 'area', 'areas', 'event', 'events', 'cinema', 'theatre', 'theater', 'mall',
  'block', 'mention', 'want', 'need', 'in', 'on', 'at', 'to', 'of', 'is', 'it',
]);

const containsCinemaIntent = (text) => /(pvr|inox|cinepolis|cinema|theatre|theater|mall|area)/i.test(text || '');

const tokenizeSearchTerms = (text) => {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !stopWords.has(token));
};

const buildCinemaFinderReply = (userText, theatres, events) => {
  const terms = tokenizeSearchTerms(userText);
  const theatreById = new Map(theatres.map((theatre) => [theatre.theatreId, theatre]));

  const matchingTheatres = theatres.filter((theatre) => {
    const haystack = `${theatre.name || ''} ${theatre.area || ''} ${theatre.mapQuery || ''}`.toLowerCase();
    if (!terms.length) {
      return true;
    }
    return terms.some((term) => haystack.includes(term));
  });

  const targetTheatres = matchingTheatres.length ? matchingTheatres : theatres;
  const theatreIds = new Set(targetTheatres.map((theatre) => theatre.theatreId));
  const matchingEvents = events.filter((eventItem) => theatreIds.has(eventItem.theatreId));
  const coveredAreas = new Set(targetTheatres.map((theatre) => theatre.area).filter(Boolean));

  const header = [
    `I found ${targetTheatres.length} theatre location(s) across ${coveredAreas.size || 1} area(s).`,
    `Matching events available: ${matchingEvents.length}.`,
    'Use these map links to open locations worldwide:',
  ];

  const theatreLines = targetTheatres.slice(0, 8).map((theatre) => {
    const mapsQuery = theatre.mapQuery || `${theatre.name || ''} ${theatre.area || ''}`.trim();
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;
    return `- ${theatre.name || 'Unnamed Theatre'} (${theatre.area || 'Unknown Area'}): ${mapsUrl}`;
  });

  const eventLines = matchingEvents.slice(0, 10).map((eventItem) => {
    const theatre = theatreById.get(eventItem.theatreId);
    return `- ${eventItem.name} | ${eventItem.eventDate || 'Date TBA'} ${eventItem.eventTime || ''} | ${theatre?.name || 'Unknown Theatre'} (${theatre?.area || 'Unknown Area'})`;
  });

  const tail = [];
  if (!matchingTheatres.length && terms.length) {
    tail.push('No exact theatre name/area match was found for your text, so I showed all current locations and events.');
  }
  if (targetTheatres.length > 8 || matchingEvents.length > 10) {
    tail.push('There are more results available in the dashboard filters.');
  }

  return [
    ...header,
    ...theatreLines,
    matchingEvents.length ? 'Events in these locations:' : 'No events are currently listed for the matched locations.',
    ...eventLines,
    ...tail,
  ].join('\n');
};

export default function ChatbotWidget({ currentUser, theatres = [], events = [], bookings = [] }) {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState([
    {
      role: 'assistant',
      content: 'Hi, I am your EventBooking assistant. Ask me about booking seats, payments, theatres, or notifications.',
    },
  ]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const endRef = React.useRef(null);

  React.useEffect(() => {
    const handleOpenChat = () => setOpen(true);
    window.addEventListener('open-eventbooking-chat', handleOpenChat);
    return () => window.removeEventListener('open-eventbooking-chat', handleOpenChat);
  }, []);

  React.useEffect(() => {
    if (open && endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const sendMessage = async (text) => {
    const cleanText = (text || input).trim();
    if (!cleanText || loading) {
      return;
    }

    const nextMessages = [...messages, { role: 'user', content: cleanText }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    if (containsCinemaIntent(cleanText)) {
      const localReply = buildCinemaFinderReply(cleanText, theatres, events);
      setMessages((prev) => [...prev, { role: 'assistant', content: localReply }]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: cleanText,
          role: currentUser?.role || 'guest',
          context: `Theatres:${theatres.length}; Events:${events.length}; Bookings:${bookings.length}`,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.status !== 'success') {
        const backendMessage = data.message || 'Chatbot request failed.';
        const detailMessage = data.details ? `\n${data.details}` : '';
        throw new Error(`${backendMessage}${detailMessage}`);
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply || 'No response received.' }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: error.message || 'Chatbot is unavailable right now. Please check backend Grok API setup.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="chatbot-launcher">
        <button className="chatbot-button" type="button" onClick={() => setOpen((value) => !value)}>
          <span className="chatbot-button-icon" aria-hidden>◉</span>
          {open ? 'Close ChatX' : 'ChatX'}
        </button>
      </div>

      {open && (
        <div className="chatbot-panel" role="dialog" aria-label="EventBooking chatbot">
          <div className="chatbot-header">
            <div>
              <h3>EventBooking ChatX</h3>
              <span>Smart booking assistant</span>
            </div>
            <button className="chatbot-close" type="button" onClick={() => setOpen(false)}>×</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`chatbot-msg ${message.role}`}>
                {message.content}
              </div>
            ))}
            {loading && <div className="chatbot-msg assistant">Thinking...</div>}
            <div ref={endRef} />
          </div>

          <div className="chatbot-footer">
            <div className="chatbot-suggestions">
              {starterQuestions.map((question) => (
                <button key={question} type="button" className="chatbot-chip" onClick={() => sendMessage(question)}>
                  {question}
                </button>
              ))}
            </div>
            <div className="chatbot-input-row">
              <input
                className="chatbot-input"
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    sendMessage();
                  }
                }}
                placeholder="Ask something about booking, payment, or theatre updates..."
              />
              <button className="chatbot-send" type="button" onClick={() => sendMessage()} disabled={loading}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
