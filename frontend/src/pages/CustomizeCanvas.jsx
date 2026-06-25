import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import api from '../api/axios';

const FONTS      = ['Arial', 'Impact', 'Courier New', 'Georgia', 'Comic Sans MS', 'Times New Roman'];
const SIZES      = ['S', 'M', 'L', 'XL', '2XL'];
const COLORS     = ['white', 'black'];

//Stability AI 
const STABILITY_API_KEY = 'sk-Og9MM7ujVO57UP8RzlVfYgKNKr52qoUpqoWWxHvgUyIaSdpS';

async function fetchAIGeneratedImage(prompt) {
    const enhancedPrompt = `${prompt.trim()}, t-shirt graphic design, flat vector art, clean background, high quality, standalone`;
    
    if (!STABILITY_API_KEY || STABILITY_API_KEY.includes('YOUR_STABILITY')) {
        throw new Error("Missing Stability API Key. Please add it to DesignerCanvas.jsx.");
    }

    const url = `https://api.stability.ai/v2beta/stable-image/generate/core`;
    
    const formData = new FormData();
    formData.append('prompt', enhancedPrompt);
    formData.append('output_format', 'png');

    let response;
    try {
        response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${STABILITY_API_KEY}`,
                'Accept': 'image/*'
            },
            body: formData
        });
    } catch(err) {
        throw new Error("Network error reaching Stability AI API.");
    }

    if (!response.ok) {
        let errDesc = response.statusText;
        try {
            const errorData = await response.json();
            errDesc = errorData.message || errDesc;
        } catch(e) {}
        
        throw new Error(`Stability API Error: ${errDesc}`);
    }

    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to convert Stability image'));
        reader.readAsDataURL(blob);
    });
}

export default function DesignerCanvas() {
    const canvasRef    = useRef(null);
    const fabricRef    = useRef(null);
    const fileInputRef = useRef(null);

    const [tshirtColor, setTshirtColor]   = useState('white');
    const [side, setSide]                 = useState('front');
    const [savedDesigns, setSavedDesigns] = useState({
        front: null,
        back:  null,
    });
    // Per-side captured preview images (jpeg data URLs)
    const [savedPreviews, setSavedPreviews] = useState({
        front: null,
        back:  null,
    });

    const [textValue,  setTextValue]  = useState('');
    const [fontFamily, setFontFamily] = useState('Arial');
    const [fontSize,   setFontSize]   = useState(28);
    const [textColor,  setTextColor]  = useState('#111111');

    const [hasSelection, setHasSelection] = useState(false);

    const [aiPrompt,      setAiPrompt]      = useState('');
    const [aiLoading,     setAiLoading]     = useState(false);
    const [aiError,       setAiError]       = useState('');
    const [aiLastImage,   setAiLastImage]   = useState('');

    const [quantities, setQuantities] = useState({
        S: 0,
        M: 1,
        L: 0,
        XL: 0,
        '2XL': 0
    });

    const [toast, setToast] = useState('');

    const addDesignToCanvas = async (url) => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        try {
            const img = await fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
            img.scaleToWidth(180);
            img.set({
                left:    canvas.width  / 2,
                top:     canvas.height / 2,
                originX: 'center',
                originY: 'center',
                cornerStyle: 'circle',
                cornerColor: '#000000',
                transparentCorners: false,
            });
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
            showToast('Design added to canvas!');
        } catch (err) {
            console.error('Failed to add image to canvas:', err);
            showToast('Error adding design to canvas.');
        }
    };

    useEffect(() => {
        if (fabricRef.current) return;

        const canvas = new fabric.Canvas(canvasRef.current, {
            width:                  400,
            height:                 500,
            preserveObjectStacking: true,
            backgroundColor:        '#f1f5f9',
        });

        fabricRef.current = canvas;

        const onSelect  = () => setHasSelection(!!canvas.getActiveObject());
        const onClear   = () => setHasSelection(false);

        canvas.on('selection:created', onSelect);
        canvas.on('selection:updated', onSelect);
        canvas.on('selection:cleared', onClear);

        loadBackground('white', 'front');

        return () => {
            canvas.dispose();
            fabricRef.current = null;
        };
    }, []);

    const loadBackground = async (color, viewSide) => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        const url = `/${color}-${viewSide}.png`;

        try {
            const img   = await fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
            const scale = Math.min(canvas.width / img.width, canvas.height / img.height);

            img.set({
                scaleX:     scale,
                scaleY:     scale,
                originX:    'center',
                originY:    'center',
                left:       canvas.width  / 2,
                top:        canvas.height / 2,
                selectable: false,
                evented:    false,
                hoverCursor:'default',
            });

            canvas.backgroundImage = img;
            canvas.renderAll();
        } catch (err) {
            console.warn('Background image load failed:', err);
        }
    };

    const handleColorChange = async (newColor) => {
        setTshirtColor(newColor);
        await loadBackground(newColor, side);
    };

    const handleSideToggle = async (newSide) => {
        if (newSide === side) return;
        const canvas = fabricRef.current;
        if (!canvas) return;

        // Snapshot the current side's JSON + preview before leaving
        const currentJSON    = canvas.toJSON();
        const currentPreview = canvas.toDataURL({ format: 'jpeg', multiplier: 1 });
        setSavedDesigns(prev  => ({ ...prev, [side]: currentJSON    }));
        setSavedPreviews(prev => ({ ...prev, [side]: currentPreview }));

        canvas.clear();

        await loadBackground(tshirtColor, newSide);

        const previousDesign = savedDesigns[newSide];
        if (previousDesign) {
            await canvas.loadFromJSON(previousDesign);
            await loadBackground(tshirtColor, newSide);
        }

        setSide(newSide);
    };

    const handleAddText = () => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        const label = textValue.trim() || 'Your Text';

        const textObj = new fabric.IText(label, {
            left:              canvas.width  / 2,
            top:               canvas.height / 2,
            originX:           'center',
            originY:           'center',
            fontFamily,
            fontSize:          Number(fontSize),
            fill:              textColor,
            fontWeight:        'bold',
            cornerStyle:       'circle',
            cornerColor:       '#6366f1',
            transparentCorners: false,
        });

        canvas.add(textObj);
        canvas.setActiveObject(textObj);
        canvas.renderAll();
        setTextValue('');
    };

    useEffect(() => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const active = canvas.getActiveObject();
        if (active && active.type === 'i-text') {
            active.set({ fontFamily, fill: textColor, fontSize: Number(fontSize) });
            canvas.renderAll();
        }
    }, [fontFamily, textColor, fontSize]);

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            addDesignToCanvas(ev.target.result);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleAiGenerate = async () => {
        if (!aiPrompt.trim()) return;
        setAiLoading(true);
        setAiError('');
        setAiLastImage('');

        try {
            const dataUrl = await fetchAIGeneratedImage(aiPrompt.trim());
            setAiLastImage(dataUrl);
            await addDesignToCanvas(dataUrl);
        } catch (err) {
            console.error('AI generation error:', err);
            setAiError(` ${err.message || 'Could not generate image. Check your API key.'}`);
        } finally {
            setAiLoading(false);
        }
    };

    const handleDeleteSelected = () => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const active = canvas.getActiveObject();
        if (active) {
            canvas.remove(active);
            canvas.discardActiveObject();
            canvas.renderAll();
        }
    };

    const handleClearCanvas = () => {
        if (!window.confirm('Clear all objects from this side?')) return;
        const canvas = fabricRef.current;
        if (!canvas) return;
        canvas.getObjects().forEach(obj => canvas.remove(obj));
        canvas.renderAll();
    };

    const handleDownload = (format = 'png') => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        const dataURL = canvas.toDataURL({
            format,
            quality:    1.0,
            multiplier: 2,
        });

        const link = document.createElement('a');
        link.href     = dataURL;
        link.download = `slaughter-studio-${tshirtColor}-${side}.${format}`;
        link.click();
        showToast(`Downloaded as ${format.toUpperCase()}!`);
    };

    const handleSendToAdmin = async () => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        const totalQty = Object.values(quantities).reduce((a, b) => a + b, 0);
        if (totalQty === 0) {
            showToast('Please select at least one item quantity.');
            return;
        }

        // Capture current visible side
        const currentJSON    = canvas.toJSON();
        const currentPreview = canvas.toDataURL({ format: 'jpeg', multiplier: 1 });

        // Merge: current side overrides whatever was saved
        const allDesigns = {
            ...savedDesigns,
            [side]: currentJSON,
        };
        const allPreviews = {
            ...savedPreviews,
            [side]: currentPreview,
        };

        const payload = {
            designs:           allDesigns,
            frontPreviewImage: allPreviews.front || '',
            backPreviewImage:  allPreviews.back  || '',
            // legacy field — keep as current side for backward compat
            previewImage:      currentPreview,
            tshirtColor,
            size:              "Mixed",
            quantity:          totalQty,
            sizeQuantities:    quantities,
            submittedAt:       new Date().toISOString(),
        };

        console.log('📦 Sending to admin:', payload);

        try {
            const res = await api.post('/api/orders/send-design', payload);
            if (res.status === 200) {
                showToast('Order sent successfully! ✅');
            } else {
                showToast('Design logged to console (mock mode).');
            }
        } catch (error) {
            console.error('❌ Error sending design:', error);
            showToast('Design logged to console (mock mode).');
        }
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    return (
        <div className="flex flex-col min-h-screen bg-white font-sans selection:bg-black selection:text-white">
            {/* ═══════════════════  TITLE SECTION  ═══════════════════ */}
            <div className="max-w-7xl mx-auto w-full px-6 pt-8 pb-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-serif text-black leading-tight">
                            Create Your <span className="italic">Signature</span> Piece
                        </h1>
                        <p className="text-gray-500 mt-3 max-w-lg text-sm tracking-wide leading-relaxed">
                            Use our professional design studio to craft unique streetwear. Toggle between front and back views, upload your own graphics, or let AI generate a one-of-a-kind masterpiece for you.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Current View</span>
                            <span className="px-4 py-1.5 rounded-full text-[11px] font-black bg-black text-white uppercase tracking-widest">
                                {side}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════  STUDIO TOOLBAR  ═══════════════════ */}
            <div className="sticky top-[110px] z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4">
                <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center lg:justify-between gap-6">

                    {/* View & Color Controls */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-1.5 p-1 bg-gray-50 rounded-xl border border-gray-100">
                            {['front', 'back'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => handleSideToggle(s)}
                                    className={`px-5 py-2 text-[11px] font-black rounded-lg transition-all uppercase tracking-widest ${side === s
                                            ? 'bg-white text-black shadow-sm border border-gray-100'
                                            : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>

                        <div className="h-8 w-px bg-gray-100 hidden sm:block" />

                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fabric</span>
                            {COLORS.map(c => (
                                <button
                                    key={c}
                                    title={c}
                                    onClick={() => handleColorChange(c)}
                                    className={`w-8 h-8 rounded-full border-2 transition-all shadow-inner ${c === 'white' ? 'bg-white' : 'bg-black'
                                        } ${tshirtColor === c ? 'border-black scale-110' : 'border-gray-200 hover:border-gray-300'}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Text Styling Controls */}
                    <div className="flex items-center gap-4 flex-wrap justify-center">
                        <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-100 p-1">
                            <input
                                type="text"
                                value={textValue}
                                onChange={e => setTextValue(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddText()}
                                placeholder="Enter text..."
                                className="bg-transparent px-3 py-1.5 text-xs font-medium outline-none w-32 placeholder:text-gray-400"
                            />
                            <button
                                onClick={handleAddText}
                                className="bg-black text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-colors"
                            >
                                Add
                            </button>
                        </div>

                        <select
                            value={fontFamily}
                            onChange={e => setFontFamily(e.target.value)}
                            className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                            {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>

                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase">Size</span>
                            <input
                                type="number"
                                value={fontSize}
                                min={8} max={120}
                                onChange={e => setFontSize(e.target.value)}
                                className="bg-transparent w-10 text-xs font-bold outline-none"
                            />
                        </div>

                        <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-gray-100 shadow-sm" title="Text Color">
                            <input
                                type="color"
                                value={textColor}
                                onChange={e => setTextColor(e.target.value)}
                                className="absolute inset-[-4px] w-[130%] h-[130%] cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-600 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                        >
                            Upload
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />

                        <button
                            onClick={handleDeleteSelected}
                            disabled={!hasSelection}
                            className="p-2.5 text-red-500 bg-red-50 rounded-xl disabled:opacity-30 transition-all hover:bg-red-100"
                            title="Delete Selected"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>

                        <button
                            onClick={handleClearCanvas}
                            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* ═══════════════════  MAIN STUDIO AREA  ═══════════════════ */}
            <div className="max-w-[1600px] mx-auto w-full px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* ─── LEFT: AI & ASSETS ─── */}
                    <aside className="lg:col-span-3 space-y-6">
                        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-black text-white rounded-2xl flex items-center justify-center font-serif italic text-xl">Ai</div>
                                <h2 className="font-serif text-2xl text-black">Graphic Studio</h2>
                            </div>

                            <p className="text-[11px] text-gray-500 mb-6 leading-relaxed">
                                Experience the future of design. Describe any style or concept, and our AI will render a high-quality graphic for your piece.
                            </p>

                            <textarea
                                rows={4}
                                value={aiPrompt}
                                onChange={e => setAiPrompt(e.target.value)}
                                placeholder="Describe your masterpiece..."
                                className="w-full resize-none px-4 py-4 text-xs font-medium bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-black transition-all leading-relaxed placeholder:text-gray-300"
                            />

                            <button
                                onClick={handleAiGenerate}
                                disabled={aiLoading || !aiPrompt.trim()}
                                className="mt-4 w-full bg-black text-white font-black text-[11px] uppercase tracking-[0.2em] py-4 rounded-2xl disabled:opacity-20 hover:bg-gray-900 transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-2"
                            >
                                {aiLoading ? (
                                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : 'Generate Design'}
                            </button>

                            {aiError && (
                                <p className="mt-4 text-[10px] text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 font-medium">{aiError}</p>
                            )}

                            {aiLastImage && !aiLoading && (
                                <div className="mt-8 pt-8 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Active Graphic</p>
                                        <button onClick={handleAiGenerate} className="text-[10px] font-black text-black uppercase decoration-1 underline-offset-4 hover:underline">Retry</button>
                                    </div>
                                    <div 
                                        className="group relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
                                        onClick={() => addDesignToCanvas(aiLastImage)}
                                    >
                                        <img src={aiLastImage} alt="AI output" className="w-full aspect-square object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-white text-[10px] font-black uppercase tracking-widest">Add To Canvas</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                            <h4 className="font-serif text-lg text-black mb-2">Design Tips</h4>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                For best results with AI, mention specific styles like <span className="text-black font-semibold">"vintage streetwear"</span>, <span className="text-black font-semibold">"minimalist line art"</span>, or <span className="text-black font-semibold">"cyberpunk aesthetic"</span>. Keep text elements bold and well-spaced.
                            </p>
                        </div>
                    </aside>

                    {/* ─── CENTER: CANVAS ─── */}
                    <main className="lg:col-span-6 flex flex-col items-center justify-center">
                        <div className="relative group w-full max-w-[500px] mx-auto">
                            {/* Premium frame around canvas */}
                            <div className="bg-white rounded-[40px] border border-gray-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-4 sm:p-8 transition-transform duration-700 w-full flex justify-center">
                                <div className="relative overflow-hidden rounded-2xl bg-gray-50 shadow-inner border border-gray-100 w-full max-w-[400px]">
                                    <style>{`
                                        .canvas-container {
                                            margin: 0 auto;
                                            max-width: 100%;
                                            height: auto !important;
                                        }
                                        .canvas-container canvas {
                                            max-width: 100%;
                                            height: auto !important;
                                        }
                                    `}</style>
                                    <canvas ref={canvasRef} />
                                </div>
                            </div>

                            {/* Floating indicator */}
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                                Canvas Area 400x500
                            </div>
                        </div>

                        <div className="flex gap-4 w-full max-w-md mt-12">
                            <button
                                onClick={() => handleDownload('png')}
                                className="flex-1 bg-white border border-gray-100 text-black font-black text-[11px] uppercase tracking-widest py-4 rounded-2xl hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Save PNG
                            </button>
                            <button
                                onClick={() => handleDownload('jpeg')}
                                className="flex-1 bg-white border border-gray-100 text-black font-black text-[11px] uppercase tracking-widest py-4 rounded-2xl hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Save JPG
                            </button>
                        </div>
                    </main>

                    {/* ─── RIGHT: ORDER & FINALIZATION ─── */}
                    <aside className="lg:col-span-3 space-y-6">
                        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                            <h2 className="font-serif text-2xl text-black mb-1">Order Details</h2>
                            <p className="text-xs text-gray-400 mb-8 tracking-wide">Configure your physical piece.</p>

                            {/* Size & Quantity Selection */}
                            <div className="space-y-4 mb-10">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Sizes & Quantities</label>
                                <div className="space-y-2">
                                    {SIZES.map(sz => (
                                        <div key={sz} className="flex items-center justify-between bg-gray-50 p-2 rounded-2xl border border-gray-100">
                                            <span className="text-[11px] font-black text-black ml-3 w-8">{sz}</span>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setQuantities(prev => ({ ...prev, [sz]: Math.max(0, prev[sz] - 1) }))}
                                                    className="w-8 h-8 bg-white rounded-lg shadow-sm text-black font-black hover:bg-gray-100 transition-colors flex items-center justify-center"
                                                >
                                                    −
                                                </button>
                                                <span className="w-6 text-center font-black text-black text-xs">{quantities[sz]}</span>
                                                <button
                                                    onClick={() => setQuantities(prev => ({ ...prev, [sz]: prev[sz] + 1 }))}
                                                    className="w-8 h-8 bg-white rounded-lg shadow-sm text-black font-black hover:bg-gray-100 transition-colors flex items-center justify-center"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center px-2 mt-4">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Quantity</span>
                                    <span className="text-sm font-black text-black">
                                        {Object.values(quantities).reduce((a, b) => a + b, 0)}
                                    </span>
                                </div>
                            </div>

                            {/* Summary Block */}
                            <div className="space-y-3 bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100">
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                                    <span className="text-gray-400">Garment</span>
                                    <span className="text-black">{tshirtColor} Tee</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                                    <span className="text-gray-400">Total Quantities</span>
                                    <span className="text-black">{Object.values(quantities).reduce((a, b) => a + b, 0)} Items</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                                    <span className="text-gray-400">Print Sides</span>
                                    <span className="text-black text-right">
                                        {[savedDesigns.front && 'Front', savedDesigns.back && 'Back', (() => {
                                            const c = side.charAt(0).toUpperCase() + side.slice(1);
                                            return !savedDesigns[side] ? c : null;
                                        })()].filter(Boolean).join(', ')}
                                    </span>
                                </div>
                            </div>

                            {/* Submission */}
                            <button
                                onClick={handleSendToAdmin}
                                className="w-full bg-black text-white font-black text-[11px] uppercase tracking-[0.3em] py-5 rounded-2xl shadow-2xl shadow-gray-300 hover:bg-gray-900 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                Send To Production
                            </button>
                        </div>
                        
                        <p className="text-[9px] text-center text-gray-300 uppercase tracking-widest font-black">
                            Secure Production Workflow &copy; SLAUGHTER
                        </p>
                    </aside>
                </div>
            </div>

            {/* ═══════════════════  FEEDBACK TOAST  ═══════════════════ */}
            {toast && (
                <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-black text-white px-8 py-4 rounded-2xl shadow-[0_24px_48px_rgba(0,0,0,0.2)] z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em]">{toast}</p>
                </div>
            )}
        </div>
    );
}