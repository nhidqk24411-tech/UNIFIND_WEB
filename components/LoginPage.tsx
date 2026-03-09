
import React, { useState } from 'react';
import { UserProfile, Role } from '../types';
import { USERS_DB } from '../constants';
import { Eye, EyeOff, GraduationCap, Lock, Mail, Loader2, ArrowLeft, CheckCircle, AlertOctagon, Settings } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

interface LoginPageProps {
  onLogin: (user: UserProfile) => void;
  onOpenSettings: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onOpenSettings }) => {
  const { t, language } = useLanguage();
  const [view, setView] = useState<'LOGIN' | 'FORGOT' | 'VERIFY_PENDING'>('LOGIN');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Verification Pending State
  const [pendingUser, setPendingUser] = useState<UserProfile | null>(null);

  // Mock Backend Login Logic
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
        // 1. Validation for @st.uel.edu.vn
        if (!email.includes('@st.uel.edu.vn') && !email.includes('@student.edu.vn')) {
             setError('Email must be a valid school address (@st.uel.edu.vn)');
             setIsLoading(false);
             return;
        }

        // 2. Find User in Mock DB
        const user = USERS_DB.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            setError('User not found. Please contact administration.');
            setIsLoading(false);
            return;
        }

        if (user.isLocked) {
            setError('This account has been locked due to suspicious activity.');
            setIsLoading(false);
            return;
        }

        // 3. Check Password (Mocking: Input must match StudentID for demo)
        if (password !== user.studentId) {
            setError('Incorrect password. Default password is your Student ID.');
            setIsLoading(false);
            return;
        }

        // 4. CHECK FIRST TIME LOGIN / VERIFICATION
        if (user.isVerified === false) {
            setPendingUser(user);
            setView('VERIFY_PENDING');
            setIsLoading(false);
            
            // Auto Trigger the "Email Sent" alert
            alert(`[HỆ THỐNG] Phát hiện đăng nhập lần đầu.\n\nMột email xác thực đã được gửi đến ${user.email}.\nVui lòng kiểm tra hộp thư để kích hoạt tài khoản.`);
            return;
        }

        // Success
        onLogin(user);
        setIsLoading(false);
    }, 1000);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Construct UserProfile from Firebase user
      const userProfile: UserProfile = {
        id: user.uid,
        name: user.displayName || 'User',
        email: user.email || '',
        phone: user.phoneNumber || '',
        studentId: user.email?.split('@')[0] || 'G-USER', // Fallback for studentId
        avatarUrl: user.photoURL || `https://ui-avatars.com/api/?background=random&name=${user.displayName || 'User'}`,
        joinedDate: new Date().toISOString(),
        role: 'USER',
        isVerified: true
      };
      
      onLogin(userProfile);
    } catch (err: any) {
      console.error("Google Login Error:", err);
      if (err.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname;
        const consoleUrl = 'https://console.firebase.google.com/project/unifind-ai/authentication/settings';
        
        setError(language === 'vi' 
          ? `Lỗi: Tên miền "${currentDomain}" chưa được cấp quyền. Bạn cần truy cập Firebase Console và thêm nó vào mục "Authorized domains".` 
          : `Error: Domain "${currentDomain}" is not authorized. You must add it to "Authorized domains" in the Firebase Console.`);
          
        console.log("Current Domain:", currentDomain);
        console.log("Firebase Console Settings:", consoleUrl);
      } else {
        setError(err.message || 'Failed to login with Google');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setTimeout(() => {
          if (!forgotEmail.includes('@st.uel.edu.vn') && !forgotEmail.includes('@student.edu.vn')) {
              setError('Please enter a valid school email address.');
              setIsLoading(false);
              return;
          }
          
          // SIMULATION ALERT
          alert(`[MÔ PHỎNG HỆ THỐNG]\n\nĐã gửi email đến: ${forgotEmail}\n\nTiêu đề: Đặt lại mật khẩu UEL Find\nNội dung: Nhấp vào đường dẫn bên dưới để đặt lại mật khẩu của bạn...\n\n(Đây là mô phỏng vì ứng dụng chưa kết nối Server gửi mail thực tế)`);

          setResetSent(true);
          setIsLoading(false);
      }, 1500);
  };

  const handleSimulateVerificationClick = () => {
      // Allow user to proceed as if they clicked the link
      if (pendingUser) {
          const verifiedUser = { ...pendingUser, isVerified: true };
          alert("Xác thực thành công! Đang đăng nhập...");
          onLogin(verifiedUser);
      }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/To%C3%A0_nh%C3%A0_h%E1%BB%8Dc_t%E1%BA%ADp_B1_v%C3%A0_to%C3%A0_nh%C3%A0_th%C6%B0_vi%E1%BB%87n_B2_UEL.jpg/640px-To%C3%A0_nh%C3%A0_h%E1%BB%8Dc_t%E1%BA%ADp_B1_v%C3%A0_to%C3%A0_nh%C3%A0_th%C6%B0_vi%E1%BB%87n_B2_UEL.jpg")' }}
    >
       {/* Background Overlay */}
       <div className="absolute inset-0 bg-brand-900/70 backdrop-blur-sm"></div>

       {/* SETTINGS BUTTON (Added) */}
       <button 
            onClick={onOpenSettings} 
            className="absolute top-6 right-6 p-2 text-white/30 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition z-50 backdrop-blur-sm border border-white/5"
            title="Settings"
       >
            <Settings className="w-6 h-6" />
       </button>

       <div className="w-full max-w-md bg-brand-800/80 backdrop-blur-md border border-brand-700 rounded-2xl shadow-2xl overflow-hidden z-10">
            {/* Header */}
            <div className="p-8 text-center border-b border-brand-700 bg-brand-900/50">
                  <div className="bg-white w-20 h-20 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-brand-500/20 p-2">
                     <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/8/88/Logo_Tr%C6%B0%E1%BB%9Dng_%C4%90%E1%BA%A1i_h%E1%BB%8Dc_kinh_t%E1%BA%BF_-_Lu%E1%BA%ADt_%28UEL%29%2C_%C4%90HQG-HCM%2C_220px.png?_=20231026090505" 
                        alt="UEL Logo" 
                        className="h-16 w-auto object-contain"
                        referrerPolicy="no-referrer"
                    />
                  </div>
                 <h1 className="text-2xl font-bold text-white">
                     {view === 'LOGIN' && t.auth.welcome}
                     {view === 'FORGOT' && t.auth.resetTitle}
                     {view === 'VERIFY_PENDING' && t.auth.verifyTitle}
                 </h1>
                 <p className="text-gray-400 text-sm mt-1">
                     {view === 'LOGIN' && t.auth.loginSubtitle}
                     {view === 'FORGOT' && t.auth.resetSubtitle}
                     {view === 'VERIFY_PENDING' && t.auth.verifySubtitle}
                 </p>
            </div>

            {/* LOGIN FORM */}
            {view === 'LOGIN' && (
                <form onSubmit={handleLogin} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-700 bg-red-50 font-medium text-sm flex flex-col gap-2 animate-fade-in">
                            <div className="flex items-center gap-2">
                                <AlertOctagon className="w-4 h-4" /> 
                                <span className="whitespace-pre-line">{error}</span>
                            </div>
                            {error.includes('Authorized domains') && (
                                <div className="mt-2 pt-2 border-t border-red-200 space-y-2">
                                    <div className="flex items-center justify-between bg-white/50 p-2 rounded border border-red-200">
                                        <code className="text-[10px] font-mono select-all">{window.location.hostname}</code>
                                        <span className="text-[10px] text-gray-400 uppercase font-bold">Copy this</span>
                                    </div>
                                    <a 
                                        href="https://console.firebase.google.com/project/unifind-ai/authentication/settings" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-brand-600 hover:underline flex items-center gap-1 text-xs font-bold bg-white p-2 rounded border border-brand-200 justify-center"
                                    >
                                        Open Firebase Console Settings
                                    </a>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">{t.auth.emailLabel}</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-brand-600 transition" />
                            </div>
                            <input 
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="mssv@st.uel.edu.vn"
                                className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-10 pr-4 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">{t.auth.passwordLabel}</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-brand-600 transition" />
                            </div>
                            <input 
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your MSSV"
                                className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-10 pr-12 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition shadow-sm"
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-brand-600 transition"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                        <div className="flex justify-end">
                            <button 
                                type="button" 
                                onClick={() => { setView('FORGOT'); setError(''); }}
                                className="text-xs text-brand-400 hover:text-brand-300 hover:underline"
                            >
                                {t.auth.forgot}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.auth.signIn}
                    </button>

                    <div className="relative flex items-center justify-center py-2">
                        <div className="border-t border-gray-300 w-full"></div>
                        <div className="absolute bg-brand-800 px-2 text-xs text-gray-500 uppercase tracking-wider">
                            {language === 'vi' ? 'Hoặc' : 'Or'}
                        </div>
                    </div>

                    <button 
                        type="button" 
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-xl border border-gray-300 shadow-sm transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                        {language === 'vi' ? 'Đăng nhập bằng Google' : 'Sign in with Google'}
                    </button>
                    
                     <div className="mt-4 text-center">
                        <p className="text-xs text-gray-500">For testing first-login flow, try:</p>
                        <p className="text-xs text-gray-400 font-mono">newk24@st.uel.edu.vn / K24000000</p>
                    </div>
                </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {view === 'FORGOT' && (
                <div className="p-8 pt-4">
                    {!resetSent ? (
                        <form onSubmit={handleForgotPassword} className="space-y-6">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm flex items-center gap-2 animate-fade-in">
                                    <Lock className="w-4 h-4" /> {error}
                                </div>
                            )}
                            <div className="bg-brand-900/50 p-4 rounded-lg border border-brand-700 mb-4">
                                <p className="text-sm text-gray-300">
                                    Enter your student email address. We will send you a verification link to reset your password.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">{t.auth.emailLabel}</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-brand-600 transition" />
                                    </div>
                                    <input 
                                        type="email"
                                        required
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        placeholder="mssv@st.uel.edu.vn"
                                        className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-10 pr-4 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition shadow-sm"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t.auth.sendLink}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center space-y-4 animate-fade-in">
                            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white">{t.auth.checkEmail}</h3>
                            <p className="text-gray-300 text-sm">
                                {t.auth.emailSentTo} <br/>
                                <span className="font-bold text-white">{forgotEmail}</span>
                            </p>
                            <div className="p-3 bg-brand-900/50 rounded border border-brand-700 text-xs text-gray-400">
                                Be sure to check your spam folder if you don't see it within a few minutes.
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={() => { setView('LOGIN'); setResetSent(false); setForgotEmail(''); }}
                        className="mt-6 w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white transition py-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> {t.auth.back}
                    </button>
                </div>
            )}

            {/* FIRST TIME LOGIN VERIFICATION PENDING */}
            {view === 'VERIFY_PENDING' && (
                <div className="p-8 pt-4 text-center space-y-6 animate-fade-in">
                    <div className="w-20 h-20 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/50 animate-pulse">
                        <Mail className="w-10 h-10" />
                    </div>
                    
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">{t.auth.activationRequired}</h3>
                        <p className="text-gray-300 text-sm">
                            {t.auth.firstTimeMsg}
                        </p>
                    </div>

                    <div className="bg-brand-900/50 p-4 rounded-lg border border-brand-700 text-left">
                        <p className="text-xs text-gray-400 mb-1">Email sent to:</p>
                        <p className="text-white font-bold text-sm">{pendingUser?.email}</p>
                    </div>
                    
                    <div className="space-y-3">
                         <button 
                            onClick={handleSimulateVerificationClick}
                            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" /> {t.auth.clickedLink}
                        </button>
                         <p className="text-[10px] text-gray-500 italic">
                            (Simulation: Clicking this will authenticate you)
                        </p>
                    </div>

                    <button 
                        onClick={() => { setView('LOGIN'); setPendingUser(null); }}
                        className="mt-4 w-full flex items-center justify-center gap-2 text-gray-400 hover:text-white transition py-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> {t.auth.return}
                    </button>
                </div>
            )}

            <div className="bg-brand-900/50 p-4 text-center border-t border-brand-700">
                <p className="text-xs text-gray-500">
                    {t.auth.defaultPassMsg} <br/>
                    Contact Academic Affairs if you cannot login.
                </p>
            </div>
       </div>
    </div>
  );
};
