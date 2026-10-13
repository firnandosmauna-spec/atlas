import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/authStore';
import { useAppConfigStore } from '../store/appConfigStore';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  const { appName, tagline, institutionName, version } = useAppConfigStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      if (isLogin) {
        // LOGIN
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        if (data.user) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select(`id, email, full_name, role_id, roles (name)`)
            .eq('id', data.user.id)
            .maybeSingle();
            
          if (userError) console.error("Error fetching user role", userError);
          
          login({
            id: data.user.id,
            email: data.user.email || '',
            name: userData?.full_name || 'User',
            role: (userData?.roles?.name as any) || 'Auditor',
            organizationId: 'kap-123'
          });
          navigate('/dashboard');
        }
      } else {
        // REGISTER
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password
        });
        
        if (authError) throw authError;
        
        if (authData.user) {
          const { data: roleData } = await supabase.from('roles').select('id').eq('name', 'Admin').maybeSingle();
          const { error: insertError } = await supabase.from('users').insert({
            id: authData.user.id,
            email: email,
            full_name: fullName || email.split('@')[0],
            role_id: roleData?.id || null
          });
          
          if (insertError) {
            console.error('Insert User Error:', insertError);
            throw new Error(`Gagal menyimpan profil: ${insertError.message} (Pastikan RLS sudah diizinkan)`);
          }
          
          login({
            id: authData.user.id,
            email: authData.user.email || '',
            name: fullName || email.split('@')[0],
            role: 'Admin',
            organizationId: 'kap-123'
          });
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat autentikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      
      {/* Brand Section (Left Panel) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-950 p-12 flex-col justify-between text-white border-r border-gray-900">
        <div>
          <div className="flex items-center space-x-3 mb-16">
            <div className="w-10 h-10 bg-white flex items-center justify-center">
              <Building2 className="text-gray-950" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight uppercase">{appName}</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight max-w-lg uppercase">
            {tagline}
          </h1>
          <p className="mt-6 text-sm lg:text-lg text-gray-400 max-w-md leading-relaxed border-l-2 border-gray-700 pl-4">
            Sistem informasi operasional dan pendokumentasian proses audit independen berdasarkan kerangka kerja {institutionName}.
          </p>
        </div>
        
        <div className="text-xs text-gray-500 font-bold tracking-widest uppercase">
          VER {version} / SECURE AUTH
        </div>
      </div>

      {/* Form Section (Right Panel) */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 md:px-16 lg:px-32 py-8 bg-white">
        <div className="max-w-sm w-full mx-auto lg:mx-0">
          
          <div className="lg:hidden mb-8 sm:mb-12 flex items-center space-x-3 border-b border-gray-200 pb-4">
            <div className="w-8 h-8 bg-gray-950 flex items-center justify-center">
              <Building2 className="text-white" size={16} />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900 uppercase">{appName}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight uppercase mb-1">
            {isLogin ? 'Autentikasi Sistem' : 'Pendaftaran Akun'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8 font-medium">
            {isLogin ? 'Akses sistem membutuhkan kredensial valid.' : 'Masukkan data untuk pembuatan akun.'}
          </p>

          {/* Toggle Login/Register (Sharp Tabs) */}
          <div className="flex border-b border-gray-200 mb-6 sm:mb-8">
            <button 
              type="button"
              className={`flex-1 py-3 min-h-[44px] text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors ${
                isLogin ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-400 hover:text-gray-900'
              }`}
              onClick={() => { setIsLogin(true); setErrorMsg(''); }}
            >
              Log In
            </button>
            <button 
              type="button"
              className={`flex-1 py-3 min-h-[44px] text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors ${
                !isLogin ? 'border-b-2 border-gray-900 text-gray-900' : 'text-gray-400 hover:text-gray-900'
              }`}
              onClick={() => { setIsLogin(false); setErrorMsg(''); }}
            >
              Sign Up
            </button>
          </div>

          {errorMsg && (
            <div className="bg-white border-l-4 border-red-600 text-red-700 px-4 py-3 mb-6 text-sm font-medium shadow-sm">
              {errorMsg}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {!isLogin && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Nama Lengkap</label>
                <input
                  type="text"
                  required={!isLogin}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 focus:outline-none focus:border-gray-900 focus:bg-white transition-colors text-sm text-gray-900 rounded-none"
                  placeholder="Nama sesuai KTP/Identitas"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Alamat Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 focus:outline-none focus:border-gray-900 focus:bg-white transition-colors text-sm text-gray-900 rounded-none"
                placeholder="email@kap.com"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 focus:outline-none focus:border-gray-900 focus:bg-white transition-colors text-sm text-gray-900 rounded-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 text-sm font-bold text-white bg-gray-950 hover:bg-gray-800 active:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors disabled:opacity-70 uppercase tracking-wider rounded-none mt-8"
            >
              {isLoading ? 'Memproses...' : (isLogin ? 'Masuk' : 'Buat Akun')}
            </button>
            
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
