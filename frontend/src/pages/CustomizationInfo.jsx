import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import customBanner from "../assets/custom_banner.png";

const CustomizationInfo = () => {
    const [agreed, setAgreed] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-white">
            {/* Left Side: Image (Hidden on small screens or stacked) */}
            <div className="lg:w-1/2 relative h-64 lg:h-auto overflow-hidden bg-zinc-900 shadow-2xl">
                <img
                    src={customBanner}
                    alt="Customization Background"
                    className="absolute inset-0 w-full h-full object-cover grayscale opacity-60 brightness-75 scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-12">
                    <p className="text-white/50 text-xs uppercase tracking-[0.3em] font-medium mb-2">Exclusive customization</p>
                    <h2 className="text-white text-3xl font-serif tracking-widest italic">Craft Your Narrative</h2>
                </div>
            </div>

            {/* Right Side: Content */}
            <div className="lg:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-white overflow-y-auto">
                <div className="max-w-xl w-full">
                    <header className="mb-12">
                        <h1 className="text-4xl md:text-4xl font-bold uppercase tracking-widest mb-4 font-serif text-black">
                            Guidelines
                        </h1>
                        <div className="h-1 w-20 bg-black mb-6"></div>
                        <p className="text-zinc-500 text-sm leading-relaxed tracking-wider">
                            Before you begin your design journey, please review our essential customization standards and production policies.
                        </p>
                    </header>

                    <div className="space-y-10">
                        <section className="group">
                            <h2 className="text-m font-bold uppercase tracking-[0.2em] text-black mb-4 group-hover:text-black transition-colors">01. Technical Specifications</h2>
                            <ul className="space-y-3 text-sm text-zinc-600 font-medium">
                                <li className="flex items-start">Resolution: Minimum 300 DPI for sharp prints.</li>
                                <li className="flex items-start">Formats: Standard PNG, JPG, or SVG accepted.</li>
                                <li className="flex items-start">Area: Designs must remain within specified boundary.</li>
                            </ul>
                        </section>

                        <section className="group">
                            <h2 className="text-m font-bold uppercase tracking-[0.2em] text-black mb-4 group-hover:text-black transition-colors">02. Ethics & Policy</h2>
                            <p className="text-sm text-zinc-600 leading-relaxed font-medium">
                                Respect for originality is paramount. We do not permit content that is offensive, hate-driven, or infringes on existing copyrights.
                            </p>
                        </section>

                        <section className="group">
                            <h2 className="text-m   font-bold uppercase tracking-[0.2em] text-black mb-4 group-hover:text-black transition-colors">03. Production Cycle</h2>
                            <div className="text-sm text-zinc-600 space-y-2 font-medium">
                                <p>Custom creations require 7-10 business days.</p>
                                <p className="italic text-zinc-400">Note: All bespoke items are final sale and non-returnable.</p>
                            </div>
                        </section>

                        <div className="pt-10 border-t border-zinc-100 mt-12">
                            <label className="flex items-center space-x-4 cursor-pointer group mb-8">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        className="appearance-none w-6 h-6 border-2 border-zinc-200 rounded-none checked:bg-black checked:border-black transition-all cursor-pointer"
                                    />
                                    {agreed && (
                                        <svg className="absolute inset-0 w-6 h-6 text-white p-1 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <span className="text-xs font-semibold text-zinc-500 group-hover:text-black transition-colors uppercase tracking-wider leading-relaxed">
                                    I acknowledge the production terms and understand that custom items are final sale.
                                </span>
                            </label>

                            <button
                                onClick={() => navigate("/customize-canvas")}
                                disabled={!agreed}
                                className={`w-full py-5 text-xs font-bold uppercase tracking-[0.3em] transition-all duration-500 ${agreed
                                    ? "bg-black text-white hover:bg-zinc-800 shadow-xl"
                                    : "bg-zinc-500 text-zinc-300 cursor-not-allowed"
                                    }`}
                            >
                                Enter Designer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomizationInfo;
