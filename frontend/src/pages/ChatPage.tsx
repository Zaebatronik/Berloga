import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store';
import { chatsAPI, listingsAPI, userAPI } from '../services/api';
import type { Listing, User } from '../types';

interface Message {
  _id?: string;
  senderId: string;
  text: string;
  translatedText?: string;
  originalLanguage?: string;
  createdAt: string;
  isSystemMessage?: boolean;
}

interface Chat {
  _id: string;
  listingId: string;
  participants: Array<{
    userId: string;
    nickname: string;
    language?: string;
  }>;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export default function ChatPage() {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [chat, setChat] = useState<Chat | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  // Автопрокрутка вниз при новых сообщениях
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  // Загрузка или создание чата
  useEffect(() => {
    const initChat = async () => {
      if (!listingId || !user?.id) return;

      try {
        setLoading(true);

        // 1. Загружаем объявление
        const listingResponse = await listingsAPI.getById(listingId);
        const listingData = listingResponse.data;
        setListing(listingData);

        // 2. Проверяем, не пытается ли пользователь написать сам себе
        if (listingData.userId === user.id || listingData.userId === user.telegramId) {
          setError(t('chat.cannotMessageYourself'));
          return;
        }

        // 3. Загружаем информацию о продавце
        try {
          const sellerResponse = await userAPI.getById(listingData.userId);
          setOtherUser(sellerResponse.data);
        } catch (err) {
          console.error('Не удалось загрузить продавца:', err);
        }

        // 4. Проверяем существующий чат или создаём новый
        const userChatsResponse = await chatsAPI.getByUser(user.id);
        const existingChat = userChatsResponse.data.find(
          (c: Chat) => c.listingId === listingId
        );

        if (existingChat) {
          setChat(existingChat);
        } else {
          // Создаём новый чат
          const newChatData = {
            listingId: listingId,
            participants: [
              {
                userId: user.id,
                nickname: user.nickname || 'Покупатель',
                language: i18n.language
              },
              {
                userId: listingData.userId,
                nickname: otherUser?.nickname || 'Продавец',
                language: otherUser?.language || 'ru'
              }
            ]
          };

          const newChatResponse = await chatsAPI.create(newChatData);
          setChat(newChatResponse.data);
        }

      } catch (err: any) {
        console.error('Ошибка инициализации чата:', err);
        setError(err.message || t('chat.loadError'));
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [listingId, user?.id, i18n.language]);

  // Функция перевода текста через Google Translate API (бесплатная альтернатива)
  const translateText = async (text: string, targetLang: string): Promise<string> => {
    try {
      // Используем публичный API для перевода
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
      );
      const data = await response.json();
      return data[0][0][0];
    } catch (error) {
      console.error('Ошибка перевода:', error);
      return text; // Возвращаем оригинал при ошибке
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !chat || !user) return;

    setSending(true);
    try {
      const myLanguage = i18n.language;
      const otherParticipant = chat.participants.find(p => p.userId !== user.id);
      const targetLanguage = otherParticipant?.language || 'ru';

      // Переводим сообщение для получателя, если языки разные
      let translatedText = messageText;
      if (myLanguage !== targetLanguage) {
        translatedText = await translateText(messageText, targetLanguage);
      }

      const newMessage = {
        senderId: user.id,
        text: messageText,
        translatedText: translatedText !== messageText ? translatedText : undefined,
        originalLanguage: myLanguage,
        createdAt: new Date().toISOString()
      };

      const response = await chatsAPI.sendMessage(chat._id, newMessage);
      setChat(response.data);
      setMessageText('');

      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      }

    } catch (err: any) {
      console.error('Ошибка отправки сообщения:', err);
      alert(t('chat.sendError'));
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>
          {t('common.loading')}...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>😔</div>
        <h2 style={{ marginBottom: '12px' }}>{t('chat.error')}</h2>
        <p style={{ marginBottom: '24px', color: '#666' }}>{error}</p>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          {t('common.back')}
        </button>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#f5f5f5'
    }}>
      {/* Заголовок чата */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          ←
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600', fontSize: '16px' }}>
            {otherUser?.nickname || t('chat.seller')}
          </div>
          {listing && (
            <div style={{
              fontSize: '13px',
              opacity: 0.9,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {listing.title}
            </div>
          )}
        </div>
        <button
          onClick={() => navigate(`/listing/${listingId}`)}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          📱 {t('chat.viewListing')}
        </button>
      </div>

      {/* Сообщения */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {chat?.messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#999'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>💬</div>
            <p>{t('chat.noMessages')}</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>
              {t('chat.startConversation')}
            </p>
          </div>
        ) : (
          chat?.messages.map((message, index) => {
            const isMyMessage = message.senderId === user?.id;
            const showTranslation = message.translatedText && message.originalLanguage !== i18n.language;

            return (
              <div
                key={message._id || index}
                style={{
                  display: 'flex',
                  justifyContent: isMyMessage ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    background: isMyMessage
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'white',
                    color: isMyMessage ? 'white' : '#333',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {showTranslation ? (
                    <>
                      <div style={{ marginBottom: '8px' }}>{message.text}</div>
                      <div style={{
                        fontSize: '13px',
                        opacity: 0.8,
                        paddingTop: '8px',
                        borderTop: `1px solid ${isMyMessage ? 'rgba(255,255,255,0.3)' : '#eee'}`
                      }}>
                        🌐 {message.translatedText}
                      </div>
                    </>
                  ) : (
                    <div>{message.text}</div>
                  )}
                  <div style={{
                    fontSize: '11px',
                    opacity: 0.7,
                    marginTop: '4px',
                    textAlign: 'right'
                  }}>
                    {new Date(message.createdAt).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Поле ввода */}
      <div style={{
        padding: '16px',
        background: 'white',
        borderTop: '1px solid #e5e5e5',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-end'
      }}>
        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t('chat.typePlaceholder')}
          disabled={sending}
          style={{
            flex: 1,
            minHeight: '44px',
            maxHeight: '120px',
            padding: '12px',
            borderRadius: '12px',
            border: '1px solid #ddd',
            fontSize: '15px',
            fontFamily: 'inherit',
            resize: 'none',
            outline: 'none'
          }}
        />
        <button
          onClick={handleSendMessage}
          disabled={!messageText.trim() || sending}
          style={{
            background: messageText.trim()
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : '#ddd',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            width: '44px',
            height: '44px',
            cursor: messageText.trim() ? 'pointer' : 'not-allowed',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {sending ? '⏳' : '📨'}
        </button>
      </div>
    </div>
  );
}
