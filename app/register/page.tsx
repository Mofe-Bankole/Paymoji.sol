"use client";
import { useState } from "react";
export default function Register() {
  const [regisMode, setRegisMode] = useState<"signup" | "login">("login");
  return (
    <>
      <main className="w-full max-w-[480px] mx-auto px-md py-xl flex flex-col items-center gap-lg z-10">
        {/*<!-- Animated Background Elements -->*/}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[10%] left-[-10%] w-64 h-64 bg-primary-container/20 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-[20%] right-[-10%] w-72 h-72 bg-secondary/10 rounded-full blur-[100px]"></div>
        </div>
        {/*<!-- Hero Identity Header -->*/}
        <div className="text-center space-y-sm">
          <div className="inline-flex items-center justify-center p-sm glass-surface rounded-full mb-sm border-white/5">
            <span className="text-display-emoji font-display-emoji">
              🚀 🌈 ✨
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-white">
            Welcome back
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-[280px] mx-auto">
            Your Web3 identity is just one tap away. Join the future of social
            payments.
          </p>
        </div>
        {/*<!-- Auth Card -->*/}
        <div className="w-full glass-surface p-md rounded-lg space-y-lg relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/*<!-- Glass Shine Effect -->*/}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          {/*<!-- Tab Toggle -->*/}
          <div className="flex p-1 bg-surface-container-low rounded-full">
            <button
              onClick={() => setRegisMode("login")}
              className={`${regisMode === "login" ? `flex-1 py-sm px-md rounded-full font-label-bold text-label-bold bg-white/10 text-white transition-all shadow-sm` : `flex-1 py-sm px-md rounded-full font-label-bold text-label-bold text-on-surface-variant hover:text-white transition-all`}`}
            >
              LOGIN
            </button>
            <button
              onClick={() => setRegisMode("signup")}
              className={`${regisMode === "signup" ? `flex-1 py-sm px-md rounded-full font-label-bold text-label-bold bg-white/10 text-white transition-all shadow-sm` : `flex-1 py-sm px-md rounded-full font-label-bold text-label-bold text-on-surface-variant hover:text-white transition-all`}`}
            >
              SIGNUP
            </button>
          </div>
          {/*<!-- Social Provider: Google -->*/}

          {regisMode === "login" ? (
            <>
              <div className="space-y-sm">
                <button className="w-full flex items-center justify-center gap-sm py-sm px-md glass-surface rounded-full border-white/10 hover:border-secondary transition-all active:scale-[0.98]">
                  <img
                    alt="Google Logo"
                    className="w-5 h-5"
                    src="https://storage.googleapis.com/pe-portal-consumer-prod-wagtail-static/images/GoogleG_FullColor_White_RGB_1.width-1024.png?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=wagtail%40pe-portal-consumer-prod.iam.gserviceaccount.com%2F20260430%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20260430T164449Z&X-Goog-Expires=86400&X-Goog-SignedHeaders=host&X-Goog-Signature=456bb314c1dc4ec4e9116fe0261b9821ee37e40c3b5715a5651ff97fb498c1f0714d43ae284cc9faf29682d2f1ee960ed88e94696305e59baf6f6c1107d288e0f2a23a5250a7b640c4d67663feac290a0470b25bbbf4da9f1070c24bb6a2e70aa6a58172f168efc5ae0d037e7d78e9f8ba9ab5d9722266e88053960c9ee694a2b3a510d872fe3bcb4189fb88f354128e4a48fe19614ed5ee71d97ed6af30c71a2097e9f9f91a15a5738a0973a74fea5f15689010ede18b71c79c4b1de5f0a52022735ba6805777082802e6a89f981c1156e3f7e53df93506ac9fd96a507d8dc6a0f1eab229423aeffd7b8c0d5d9a94dba9c1d4cfcf2a12e95a33cc7bd7da4aee"
                    data-alt="Official Google G logo in bright primary colors for social login button"
                  />
                  <span className="font-label-bold text-label-bold text-white uppercase tracking-widest">
                    Continue with Google
                  </span>
                </button>
              </div>
              <div className="flex items-center gap-sm">
                <div className="flex-1 h-[1px] bg-white/5"></div>
                <span className="font-label-bold text-label-bold text-on-surface-variant opacity-50">
                  OR EMAIL
                </span>
                <div className="flex-1 h-[1px] bg-white/5"></div>
              </div>
              <form className="space-y-md">
                <div className="space-y-xs">
                  <div className="relative group">
                    <span
                      className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px] group-focus-within:text-secondary transition-colors"
                      data-icon="mail"
                    ></span>
                    <input
                      className="w-full bg-surface-container-lowest border border-white/5 rounded-full py-sm pl-xl pr-md text-body-sm font-body-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/20 transition-all placeholder:text-on-surface-variant/40"
                      placeholder="Enter your email"
                      type="email"
                    />
                  </div>
                </div>
                <button className="w-full py-sm bg-gradient-to-r from-primary-container to-secondary-container text-on-primary font-label-bold text-label-bold rounded-full uppercase tracking-widest shadow-lg shadow-primary-container/20 active:scale-95 transition-transform">
                  Enter Dashboard
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-sm">
              <button className="w-full flex items-center justify-center gap-sm py-sm px-md glass-surface rounded-full border-white/10 hover:border-secondary transition-all active:scale-[0.98]">
                <img
                  alt="Google Logo"
                  className="w-5 h-5"
                  data-alt="Official Google G logo in bright primary colors for social login button"
                  src="https://storage.googleapis.com/pe-portal-consumer-prod-wagtail-static/images/GoogleG_FullColor_White_RGB_1.width-1024.png?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=wagtail%40pe-portal-consumer-prod.iam.gserviceaccount.com%2F20260430%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20260430T164449Z&X-Goog-Expires=86400&X-Goog-SignedHeaders=host&X-Goog-Signature=456bb314c1dc4ec4e9116fe0261b9821ee37e40c3b5715a5651ff97fb498c1f0714d43ae284cc9faf29682d2f1ee960ed88e94696305e59baf6f6c1107d288e0f2a23a5250a7b640c4d67663feac290a0470b25bbbf4da9f1070c24bb6a2e70aa6a58172f168efc5ae0d037e7d78e9f8ba9ab5d9722266e88053960c9ee694a2b3a510d872fe3bcb4189fb88f354128e4a48fe19614ed5ee71d97ed6af30c71a2097e9f9f91a15a5738a0973a74fea5f15689010ede18b71c79c4b1de5f0a52022735ba6805777082802e6a89f981c1156e3f7e53df93506ac9fd96a507d8dc6a0f1eab229423aeffd7b8c0d5d9a94dba9c1d4cfcf2a12e95a33cc7bd7da4aee"
                />
                <span className="font-label-bold text-label-bold text-white uppercase tracking-widest">
                  Continue with Google
                </span>
              </button>
            </div>
          )}
          {/*<!-- Card Footer: SDK Note -->*/}
          <div className="pt-sm flex flex-col items-center gap-xs">
            <div className="flex items-center gap-xs opacity-60">
              {/*<span
                class="material-symbols-outlined text-[14px]"
                data-icon="shield_lock"
                style="font-variation-settings: 'FILL' 1;"
              >
                shield_lock
              </span>*/}
              <p className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Powered by Okto SDK
              </p>
            </div>
          </div>
        </div>
        {/*<!-- Helper Links -->*/}
        <div className="flex flex-col items-center gap-sm">
          <button className="font-body-sm text-body-sm text-on-surface-variant hover:text-white transition-colors">
            Forgot your password?
          </button>
          <div className="flex items-center gap-md">
            <a
              className="font-label-bold text-label-bold text-on-surface-variant hover:text-secondary transition-colors uppercase tracking-widest"
              href="#"
            >
              Privacy
            </a>
            <span className="w-1 h-1 bg-white/10 rounded-full"></span>
            <a
              className="font-label-bold text-label-bold text-on-surface-variant hover:text-secondary transition-colors uppercase tracking-widest"
              href="#"
            >
              Terms
            </a>
          </div>
        </div>
      </main>
      <footer className="flex flex-col items-center gap-4 w-full max-w-[480px] mx-auto mt-auto pb-8 pt-4">
        <div className="flex items-center gap-6 opacity-80 hover:opacity-100 transition-all">
          <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer">
            Terms
          </span>
          <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer">
            Privacy
          </span>
          <span className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer">
            Docs
          </span>
        </div>
        <p className="font-['Plus_Jakarta_Sans'] text-[10px] uppercase tracking-widest text-slate-500">
          © 2024 paymoji.sol • Powered by Okto SDK
        </p>
      </footer>
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-40">
        <div className="absolute top-[10%] right-[5%] w-[300px] h-[300px] bg-primary rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-[10%] left-[5%] w-[300px] h-[300px] bg-secondary rounded-full blur-[120px] mix-blend-screen"></div>
      </div>
    </>
  );
}
