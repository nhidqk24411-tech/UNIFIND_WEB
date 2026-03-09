
import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS, Language } from '../constants/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof TRANSLATIONS['en'];
  pushEnabled: boolean;
  togglePushNotifications: () => Promise<boolean>;
  showDesktopNotification: (title: string, body: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('vi'); // Default to Vietnamese based on user request context
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('app_language') as Language;
    if (savedLang) setLanguageState(savedLang);

    const savedPush = localStorage.getItem('app_push_enabled');
    if (savedPush === 'true') setPushEnabled(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const togglePushNotifications = async () => {
    const newState = !pushEnabled;
    
    if (newState) {
        // Request browser permission if turning ON
        if (!('Notification' in window)) {
            alert("Trình duyệt của bạn không hỗ trợ thông báo Desktop. Nút gạt vẫn sẽ được bật nhưng bạn sẽ không thấy thông báo nổi.");
        } else {
            try {
                // Only request if it hasn't been denied yet
                if (Notification.permission === 'default') {
                    await Notification.requestPermission();
                }
                
                if (Notification.permission === 'denied') {
                    alert("Trình duyệt đang chặn thông báo. Nút gạt đã được bật, nhưng bạn cần vào cài đặt trình duyệt (biểu tượng ổ khóa) để 'Cho phép' nếu muốn thấy thông báo nổi trên Desktop.");
                }
            } catch (error) {
                console.error("Notification permission error:", error);
                alert("Không thể yêu cầu quyền thông báo do giới hạn của trình duyệt. Nút gạt vẫn sẽ được bật.");
            }
        }
    }

    setPushEnabled(newState);
    localStorage.setItem('app_push_enabled', String(newState));
    return newState;
  };

  const t = TRANSLATIONS[language];

  const showDesktopNotification = (title: string, body: string) => {
    if (!pushEnabled) return;
    
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: body,
          icon: 'https://upload.wikimedia.org/wikipedia/commons/8/88/Logo_Tr%C6%B0%E1%BB%9Dng_%C4%90%E1%BA%A1i_h%E1%BB%8Dc_kinh_t%E1%BA%BF_-_Lu%E1%BA%ADt_%28UEL%29%2C_%C4%90HQG-HCM%2C_220px.png?_=20231026090505',
        });
      } catch (e) {
        console.error("Failed to show notification:", e);
      }
    } else {
        // Log to console as a fallback if permission is missing but toggle is on
        console.log(`[Desktop Notification Blocked by Browser] ${title}: ${body}`);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, pushEnabled, togglePushNotifications, showDesktopNotification }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
