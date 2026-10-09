import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Trash2, 
  Mail, 
  Clock, 
  Sparkles, 
  ExternalLink, 
  Send,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { InquiryMessage } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: InquiryMessage[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteMessage: (id: string) => void;
  onSendTestMessage: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteMessage,
  onSendTestMessage,
}) => {
  const [selectedMessage, setSelectedMessage] = useState<InquiryMessage | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Bell className="w-5 h-5 text-emerald-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse"></span>
              )}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-950 dark:text-zinc-50">
                Inquiry Inbox & Notifications
              </h2>
              <p className="text-xs text-zinc-500">
                {unreadCount} unread • {messages.length} total inquiries
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Actions Bar */}
        <div className="px-5 py-2.5 bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-xs">
          <button
            onClick={onSendTestMessage}
            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            + Simulate Recruiter Alert
          </button>

          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-16 text-zinc-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Inbox is clear
              </p>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto mt-1">
                New contact inquiries sent via the portfolio contact form will appear here with live notifications.
              </p>
              <button
                onClick={onSendTestMessage}
                className="mt-4 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                Send Test Notification
              </button>
            </div>
          ) : (
            messages.map((msg) => {
              const isSelected = selectedMessage?.id === msg.id;
              return (
                <div
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessage(msg);
                    if (!msg.read) onMarkAsRead(msg.id);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    !msg.read
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80'
                      : 'bg-white dark:bg-zinc-850/60 border-zinc-200 dark:border-zinc-800'
                  } ${isSelected ? 'ring-2 ring-emerald-500' : 'hover:border-zinc-300 dark:hover:border-zinc-700'}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-zinc-950 dark:text-zinc-50">
                        {msg.name}
                      </span>
                      {!msg.read && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-500 text-white uppercase tracking-wider">
                          New
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 truncate mb-1">
                    {msg.subject}
                  </p>

                  <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                    {msg.message}
                  </p>

                  {/* Footer details */}
                  <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                    <span className="truncate max-w-[180px]">{msg.inquiryType}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteMessage(msg.id);
                        if (selectedMessage?.id === msg.id) setSelectedMessage(null);
                      }}
                      className="p-1 text-zinc-400 hover:text-rose-500 transition-colors"
                      title="Delete message"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Message Modal / Detail Drawer */}
        {selectedMessage && (
          <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Inquiry Detail View
              </span>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-xs text-zinc-500 hover:underline"
              >
                Close Preview
              </button>
            </div>

            <div className="text-xs space-y-1.5 font-sans bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
              <p><strong className="text-zinc-500">From:</strong> {selectedMessage.name} &lt;{selectedMessage.email}&gt;</p>
              <p><strong className="text-zinc-500">Subject:</strong> {selectedMessage.subject}</p>
              {selectedMessage.budget && (
                <p><strong className="text-zinc-500">Budget:</strong> {selectedMessage.budget}</p>
              )}
              <div className="pt-2 mt-2 border-t border-zinc-100 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {selectedMessage.message}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                Reply to {selectedMessage.name}
              </a>

              <span className="text-[10px] font-mono text-zinc-400">
                ID: {selectedMessage.id}
              </span>
            </div>
          </div>
        )}

        {/* Drawer Bottom Bar */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center text-xs text-zinc-400">
          Direct alert forwarding connected to <strong className="text-zinc-700 dark:text-zinc-300">dansorobert360@gmail.com</strong>
        </div>
      </div>
    </div>
  );
};
