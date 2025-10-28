'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronDown, FileText, LogOut, Menu, Search, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/Modal';
import { login, register } from '@/fetching/auth';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { toastError } from '@/utils/toast';
import { setCookie, cookieSetting } from '@/utils/cookie';
import { useContextStore } from '@/context/store';
import useClickOutSide from '@/hook/useClickOutSide';

const Header: React.FC = () => {
    const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);
    const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
    const router = useRouter();
    const { setIsAuthentication, isAuthentication, profile, setProfile, logout } = useContextStore();
    const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
    const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const loginMutation = useMutation({
        mutationFn: () => login(email, password),
        onSuccess: (res: any) => {
            const token = res?.data?.accessToken;
            if (token) {
                setCookie('accessToken', token, { ...cookieSetting(), 'max-age': 60 * 60 * 24 * 7, 'sameSite': 'Lax' });
            }
            toast.success('Logged in successfully');
            setIsAuthentication(true);
            setProfile(res?.data?.user);
            setShowAuthModal(false);
            // Clear form data after successful login
            setEmail('');
            setPassword('');
            setFullName('');
        },
        onError: (err: any) => {
            // Log the error message from the API response
            const errorMessage = err?.response?.data?.message?.message || err?.message || 'An error occurred';
            toastError(errorMessage);
        },
    });

    const registerMutation = useMutation({
        mutationFn: () => register(email, password, fullName),
        onSuccess: (res: any) => {
            const token = res?.accessToken;
            if (token) {
                setCookie('accessToken', token, { ...cookieSetting(), 'max-age': 60 * 60 * 24 * 7, 'sameSite': 'Lax' });
            }
            toast.success('Account created');
            setIsAuthentication(true);
            setShowAuthModal(false);
            setProfile(res?.data?.user);
            // Clear form data after successful register
            setEmail('');
            setPassword('');
            setFullName('');
        },
        onError: (err: any) => {
            const errorMessage = err?.response?.data?.message?.message || err?.message || 'An error occurred';
            toastError(errorMessage);
        },
    });

    const isAuthLoading = loginMutation.isPending || registerMutation.isPending;
    
    // Use click outside hook for dropdown
    const { ref: dropdownRef } = useClickOutSide({
        action: () => setShowUserDropdown(false)
    });

    // Use click outside hook for mobile menu
    const { ref: mobileMenuRef } = useClickOutSide({
        action: () => setShowMobileMenu(false)
    });
    return (
        <>
            <header className="fixed inset-x-0 top-0 z-50 border-b border-zinc-900 bg-black/80 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
                    {/* Brand */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
                        <span className="text-xl font-extrabold tracking-tight text-white">NewPaper</span>
                    </div>

                    {/* Search - hidden on mobile */}
                    <div className="hidden flex-1 items-center justify-center px-6 md:flex">
                        <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target as HTMLFormElement);
                            const query = formData.get('search') as string;
                            if (query && query.trim().length >= 2) {
                                const params = new URLSearchParams({ q: query.trim() });
                                // Use window.location for search to avoid Next.js routing issues
                                window.location.href = `/search?${params.toString()}`;
                            }
                        }}
                            className="relative w-full max-w-xl"
                        >
                            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                            <input
                                name="search"
                                type="text"
                                placeholder="Search articles..."
                                className="w-full placeholder:text-secondary rounded-full border text-foreground border-secondary bg-background py-2 pl-10 pr-4 text-sm outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] focus:border-primary"
                            />
                        </form>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {/* Desktop */}
                        <div className="hidden items-center gap-3 md:flex">
                            {!isAuthentication ? (
                                <button
                                    onClick={() => { setAuthTab('login'); setShowAuthModal(true); }}
                                    className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer"
                                >
                                    Join now!
                                </button>
                            ) : (
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setShowUserDropdown((v) => !v)}
                                        className="flex items-center gap-2 rounded-full border border-secondary bg-white/90 px-2 py-1 pr-3 hover:border-primary cursor-pointer"
                                    >
                                        {profile?.avatar ? (
                                            <Image
                                                src={profile.avatar}
                                                alt="avatar"
                                                width={32}
                                                height={32}
                                                className="rounded-full"
                                            />
                                        ) : (
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white text-sm font-semibold">
                                                {(profile?.username || 'U').charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="text-sm font-medium text-foreground">{profile?.username || 'User'}</span>
                                        <ChevronDown className="h-4 w-4 text-secondary" />
                                    </button>
                                    {showUserDropdown && (
                                        <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-md border border-secondary bg-background shadow-lg">
                                            <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary/10 cursor-pointer" onClick={() => router.push('/manage-post')}>
                                                <FileText className="h-4 w-4" /> Manage Post
                                            </button>
                                            <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/10 cursor-pointer" onClick={logout}>
                                                <LogOut className="h-4 w-4" /> Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <button
                            className="rounded-md p-2 hover:bg-secondary/10 md:hidden cursor-pointer"
                            onClick={() => setShowMobileMenu(true)}
                            aria-label="Open menu"
                        >
                            <Menu className="text-white" />
                        </button>
                        {isAuthLoading && (
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                        )}
                    </div>
                </div>

                {/* Mobile/Tablet slide-over */}
                {showMobileMenu && (
                    <div className="fixed inset-0 z-40 bg-black/30"></div>
                )}
                <div
                    ref={mobileMenuRef}
                    className={`fixed right-0 top-0 z-50 h-screen w-[400px] max-w-[90vw] transform bg-white shadow-xl transition-transform duration-300 ${showMobileMenu ? 'translate-x-0' : 'translate-x-full'
                        }`}
                >
                    <div className="flex h-16 items-center justify-between border-b border-secondary px-4">
                        <span className="text-lg font-bold text-foreground">NewPaper</span>
                        <button className="rounded-md p-2 hover:bg-secondary/10 cursor-pointer" onClick={() => setShowMobileMenu(false)}>
                            <X className="text-foreground" />
                        </button>
                    </div>
                    <div className="space-y-4 p-4 bg-white/90">
                        <div className="relative">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target as HTMLFormElement);
                                    const query = formData.get('search') as string;
                                    if (query && query.trim().length >= 2) {
                                        
                                        setShowMobileMenu(false);
                                        const params = new URLSearchParams({ q: query.trim() });
                                        // Use window.location for search to avoid Next.js routing issues
                                        window.location.href = `/search?${params.toString()}`;
                                    }
                                }}
                                className="relative w-full max-w-xl"
                            >
                                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                                <input
                                    name="search"
                                    type="text"
                                    placeholder="Search articles..."
                                    className="w-full placeholder:text-secondary rounded-full border text-foreground border-secondary bg-white/90 py-2 pl-10 pr-4 text-sm outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,0.2)] focus:border-primary"
                                />
                            </form>
                        </div>
                        {!isAuthentication ? (
                            <button
                                onClick={() => {
                                    setAuthTab('login');
                                    setShowAuthModal(true);
                                    setShowMobileMenu(false);
                                }}
                                className="w-full rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 cursor-pointer"
                            >
                                Join now!
                            </button>
                        ) : (
                            <div className="flex items-center gap-3 rounded-md border border-secondary p-3">
                                {profile?.avatar ? (
                                    <Image
                                        src={profile.avatar}
                                        alt="avatar"
                                        width={40}
                                        height={40}
                                        className="rounded-full"
                                    />
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white text-lg font-semibold">
                                        {(profile?.username || 'U').charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{profile?.username || 'User'}</p>
                                    <p className="text-xs text-secondary">{profile?.email || 'user@example.com'}</p>
                                </div>
                            </div>
                        )}
                        <div className="grid gap-2">
                            <button className="flex items-center gap-2 rounded-md border border-secondary px-3 py-2 text-sm text-foreground hover:bg-secondary/10 cursor-pointer" onClick={() => router.push('/manage-post')}>
                                <FileText className="h-4 w-4" /> Manage Post
                            </button>
                            <button className="flex items-center gap-2 rounded-md border border-secondary px-3 py-2 text-sm text-error hover:bg-error/10 cursor-pointer" onClick={logout}>
                                <LogOut className="h-4 w-4" /> Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            {/* Auth Modal */}
            <Modal isOpen={showAuthModal} onClose={() => {
                setShowAuthModal(false);
                // Clear form data when closing modal
                setEmail('');
                setPassword('');
                setFullName('');
            }} size="md">
                <div className="p-6">
                    <div className="mb-4 flex gap-2">
                        <button
                            onClick={() => {
                                setAuthTab('login');
                                // Clear form data when switching to login
                                setEmail('');
                                setPassword('');
                                setFullName('');
                            }}
                            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium cursor-pointer ${authTab === 'login' ? 'bg-primary text-primary-foreground' : 'bg-secondary/20 text-secondary hover:bg-secondary/30'}`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => {
                                setAuthTab('register');
                                // Clear form data when switching to register
                                setEmail('');
                                setPassword('');
                                setFullName('');
                            }}
                            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium cursor-pointer ${authTab === 'register' ? 'bg-primary text-primary-foreground' : 'bg-secondary/20 text-secondary hover:bg-secondary/30'}`}
                        >
                            Register
                        </button>
                    </div>
                    {authTab === 'login' ? (
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Email</label>
                                <input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    type="email"
                                    placeholder="you@example.com"
                                    disabled={isAuthLoading}
                                    className="w-full rounded-md border border-secondary bg-white/90 px-3 py-2 text-sm text-foreground placeholder:text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Password</label>
                                <input
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    type="password"
                                    placeholder="••••••••"
                                    disabled={isAuthLoading}
                                    className="w-full rounded-md border border-secondary bg-white/90 px-3 py-2 text-sm text-foreground placeholder:text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                                />
                            </div>
                            {loginMutation.isError && (
                                <p className="text-xs text-error">
                                    {(() => {
                                        const raw = (loginMutation.error as any)?.response?.data?.message;
                                        if (typeof raw === 'string') return raw;
                                        if (raw && typeof raw === 'object') return raw.message || JSON.stringify(raw);
                                        return 'Login failed';
                                    })()}
                                </p>
                            )}
                            <button
                                onClick={() => loginMutation.mutate()}
                                disabled={!email.trim() || !password.trim() || loginMutation.isPending}
                                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                            >
                                {loginMutation.isPending ? 'Signing in…' : 'Sign In'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Full name</label>
                                <input
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="John Doe"
                                    disabled={isAuthLoading}
                                    className="w-full rounded-md border border-secondary bg-white/90 px-3 py-2 text-sm text-foreground placeholder:text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Email</label>
                                <input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    type="email"
                                    placeholder="you@example.com"
                                    disabled={isAuthLoading}
                                    className="w-full rounded-md border border-secondary bg-white/90 px-3 py-2 text-sm text-foreground placeholder:text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-foreground">Password</label>
                                <input
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    type="password"
                                    placeholder="••••••••"
                                    disabled={isAuthLoading}
                                    className="w-full rounded-md border border-secondary bg-background px-3 py-2 text-sm text-foreground placeholder:text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                                />
                            </div>
                            {registerMutation.isError && (
                                <p className="text-xs text-error">
                                    {(() => {
                                        const raw = (registerMutation.error as any)?.response?.data?.message;
                                        if (typeof raw === 'string') return raw;
                                        if (raw && typeof raw === 'object') return raw.message || JSON.stringify(raw);
                                        return 'Register failed';
                                    })()}
                                </p>
                            )}
                            <button
                                onClick={() => registerMutation.mutate()}
                                disabled={!fullName.trim() || !email.trim() || !password.trim() || registerMutation.isPending}
                                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                            >
                                {registerMutation.isPending ? 'Creating…' : 'Create Account'}
                            </button>
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
};

export default Header;


