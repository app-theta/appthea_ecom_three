import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import DashLayout from '../../components/user/DashLayout.jsx';
import ChatPanel from '../../components/chat/ChatPanel.jsx';
import { useChat } from '../../context/ChatContext.jsx';

/** The account's chat page - the same conversation as the floating window, with more room. */
export default function Chat() {
  const { enabled, setOnPage } = useChat();

  useEffect(() => {
    setOnPage(true);
    return () => setOnPage(false);
  }, [setOnPage]);

  if (!enabled) return <Navigate to="/user/dashboard" replace />;

  return (
    <DashLayout title="Chat with us">
      <ChatPanel variant="page" />
    </DashLayout>
  );
}
