export function connectSSE(onEvent) {
  const es = new EventSource('/api/events', { withCredentials: true });

  es.addEventListener('new_confession', (e) => {
    onEvent('new_confession', JSON.parse(e.data));
  });

  es.addEventListener('moderation_action', (e) => {
    onEvent('moderation_action', JSON.parse(e.data));
  });

  es.onerror = () => {
    es.close();
    setTimeout(() => connectSSE(onEvent), 3000);
  };

  return es;
}
