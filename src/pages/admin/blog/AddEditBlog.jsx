import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, Eye, Undo, Redo, Bold, Italic, Underline, 
  Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon, 
  ChevronDown, ChevronUp, Minus, Type, Palette, Loader,
  X, Type as FontIcon, Highlighter
} from 'lucide-react';
import { addBlog, getBlogById, updateBlog, uploadBlogImage } from '../../../services/blogService';
import { getBlogCategories } from '../../../services/blogCategoryService'; 

export default function AddEditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [categories, setCategories] = useState([]);
  
  // Editor State
  const editorRef = useRef(null);
  const [title, setTitle] = useState('');
  
  // Selection State
  const savedSelection = useRef(null);

  // Image Toolbar State
  const [selectedImg, setSelectedImg] = useState(null);
  const [imgToolbarPos, setImgToolbarPos] = useState({ top: 0, left: 0 });

  // Link Modal State
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkData, setLinkData] = useState({ text: '', url: '', targetBlank: false, noFollow: false });

  // Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState({
    details: true, published: false, permalink: false, location: false, options: false
  });

  const [settings, setSettings] = useState({
    category: '', 
    author: 'Admin', 
    isEditorial: false,
    publishedDate: new Date().toISOString().slice(0,16),
    permalink: '', 
    location: '', 
    allowComments: true, 
    imageUrl: ''
  });

  // Pre-defined Colors for swift selection
  const colorPresets = [
    '#000000', '#444444', '#888888', '#CCCCCC', '#FFFFFF', 
    '#E63946', '#F4A261', '#E9C46A', '#2A9D8F', '#264653',
    '#7D2596', '#0077B6', '#D00000', '#6A4C93', '#1982C4'
  ];

  // --- INITIALIZATION ---
  useEffect(() => {
    const init = async () => {
       const cats = await getBlogCategories();
       setCategories(cats);
       if (id) {
        const data = await getBlogById(id);
        if (data) {
            setTitle(data.title);
            if (editorRef.current) editorRef.current.innerHTML = data.content;
            setSettings({
                category: data.category || (cats.length > 0 ? cats[0].name : ''),
                author: data.author || 'Admin',
                isEditorial: data.isEditorial || false,
                publishedDate: data.createdAt || new Date().toISOString(),
                permalink: data.id,
                location: data.location || '',
                allowComments: data.allowComments !== false,
                imageUrl: data.imageUrl || ''
            });
        }
      } else {
        if(cats.length > 0) setSettings(s => ({...s, category: cats[0].name}));
      }
    };
    init();
  }, [id]);

  // --- EDITOR UTILS ---
  const execCmd = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) savedSelection.current = sel.getRangeAt(0);
  };

  const restoreSelection = () => {
    if (savedSelection.current) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(savedSelection.current);
    }
  };

  // --- LINK HANDLING ---
  const openLinkModal = () => {
    saveSelection();
    const sel = window.getSelection();
    const text = sel.toString();
    setLinkData({ text, url: '', targetBlank: false, noFollow: false });
    setShowLinkModal(true);
  };

  const applyLink = () => {
    restoreSelection();
    const { text, url, targetBlank, noFollow } = linkData;
    if(!url) return setShowLinkModal(false);

    let html = `<a href="${url}"`;
    if(targetBlank) html += ` target="_blank"`;
    if(noFollow) html += ` rel="nofollow"`;
    html += `>${text || url}</a>`;

    document.execCommand('insertHTML', false, html);
    setShowLinkModal(false);
  };

  // --- IMAGE HANDLING ---
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    saveSelection();
    setUploadingImg(true);

    try {
        const uploadPromises = files.map(file => uploadBlogImage(file));
        const urls = await Promise.all(uploadPromises);
        
        restoreSelection();
        
        urls.forEach(url => {
            const imgHtml = `<img src="${url}" style="display: block; margin: 10px auto; max-width: 100%;" />`;
            document.execCommand('insertHTML', false, imgHtml);
            document.execCommand('insertHTML', false, "<p><br/></p>");
        });
    } catch (error) {
        console.error(error);
        alert("Upload failed");
    } finally {
        setUploadingImg(false);
        e.target.value = null; 
    }
  };

  const handleEditorClick = (e) => {
    const target = e.target;
    if (target.tagName === 'IMG') {
        setSelectedImg(target);
        const rect = target.getBoundingClientRect();
        const editorRect = editorRef.current.getBoundingClientRect();
        setImgToolbarPos({
            top: rect.bottom - editorRect.top + 10,
            left: rect.left - editorRect.left
        });
        target.style.outline = "3px solid rgba(125, 37, 150, 0.5)"; // Purple outline
    } else {
        if(selectedImg) {
            selectedImg.style.outline = "none";
            setSelectedImg(null);
        }
    }
  };

  const updateImage = (styleObj) => {
    if(!selectedImg) return;
    Object.assign(selectedImg.style, styleObj);
    editorRef.current.focus();
  };

  const toggleCaption = () => {
    if(!selectedImg) return;
    const parent = selectedImg.parentElement;
    if(parent.tagName === 'FIGURE') {
        const cap = parent.querySelector('figcaption');
        if(cap) cap.remove();
        else {
            const caption = document.createElement('figcaption');
            caption.innerText = "Add caption";
            caption.style.textAlign = "center";
            caption.style.color = "#666";
            caption.style.fontStyle = "italic";
            parent.appendChild(caption);
        }
    } else {
        const figure = document.createElement('figure');
        figure.style.display = selectedImg.style.display;
        figure.style.float = selectedImg.style.float;
        figure.style.margin = selectedImg.style.margin;
        figure.style.textAlign = "center";
        selectedImg.style.float = "none";
        selectedImg.style.margin = "0";
        selectedImg.parentNode.insertBefore(figure, selectedImg);
        figure.appendChild(selectedImg);
        const caption = document.createElement('figcaption');
        caption.innerText = "Add caption";
        caption.style.textAlign = "center";
        caption.style.color = "#666";
        caption.style.fontStyle = "italic";
        figure.appendChild(caption);
    }
  };

  const handleSave = async () => {
    if (!title) return alert("Title required");
    const content = editorRef.current.innerHTML;
    
    let coverImage = settings.imageUrl;
    if(!coverImage) {
        const div = document.createElement('div');
        div.innerHTML = content;
        const img = div.querySelector('img');
        if(img) coverImage = img.src;
    }

    setLoading(true);
    const payload = { ...settings, title, content, imageUrl: coverImage };
    
    try {
        if (id) await updateBlog(id, payload);
        else await addBlog(payload);
        navigate('/admin/blogs');
    } catch (e) {
        console.error(e);
        alert("Error saving");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans h-screen overflow-hidden">
      
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm h-16 flex-shrink-0">
         <div className="flex items-center gap-4 flex-1">
            <button onClick={() => navigate('/admin/blogs')}><ArrowLeft className="text-gray-500 hover:text-purple-600" /></button>
            <input 
               type="text" 
               placeholder="Post Title" 
               className="text-xl font-medium text-gray-700 w-full outline-none bg-transparent placeholder-gray-300"
               value={title}
               onChange={e => setTitle(e.target.value)}
            />
         </div>
         <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded border border-gray-200 font-medium text-sm transition-colors">
                <Eye size={16}/> Preview
            </button>
            <button onClick={handleSave} disabled={loading} className="flex items-center gap-1 px-4 py-1.5 bg-[#7D2596] hover:bg-[#631d76] text-white rounded font-bold text-sm shadow-sm transition-colors">
               {loading ? <Loader className="animate-spin" size={16}/> : <Save size={16}/>}
               {id ? 'Update' : 'Publish'}
            </button>
         </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex flex-1 overflow-hidden max-w-[1920px] mx-auto w-full">
         
         {/* LEFT: EDITOR & TOOLBAR */}
         <div className="flex-1 flex flex-col h-full bg-white relative shadow-sm z-0">
            
            {/* CONSTANT TOOLBAR */}
            <div className="border-b border-gray-200 p-1 flex flex-wrap items-center gap-1 bg-white z-40 select-none flex-shrink-0">
                
                {/* 1. History */}
                <div className="flex border-r border-gray-200 px-1 gap-0.5">
                    <TBtn onClick={() => execCmd('undo')} icon={<Undo size={15}/>} tip="Undo" />
                    <TBtn onClick={() => execCmd('redo')} icon={<Redo size={15}/>} tip="Redo" />
                </div>

                {/* 2. Font Controls */}
                <div className="flex border-r border-gray-200 px-1 gap-0.5 items-center">
                    <div className="relative group">
                        <TBtn icon={<FontIcon size={15}/>} tip="Font Family" arrow/>
                        <div className="absolute top-full left-0 bg-white border shadow-lg hidden group-hover:block w-32 py-1 z-50">
                            {['Arial', 'Georgia', 'Verdana', 'Courier New'].map(f => (
                                <button key={f} onMouseDown={e => {e.preventDefault(); execCmd('fontName', f)}} className="block w-full text-left px-3 py-1 hover:bg-gray-100 text-sm" style={{fontFamily: f}}>{f}</button>
                            ))}
                        </div>
                    </div>
                    <div className="relative group">
                        <TBtn icon={<Type size={15}/>} tip="Font Size" arrow/>
                        <div className="absolute top-full left-0 bg-white border shadow-lg hidden group-hover:block w-32 py-1 z-50">
                            {[1, 2, 3, 4, 5, 6, 7].map(s => (
                                <button key={s} onMouseDown={e => {e.preventDefault(); execCmd('fontSize', s)}} className="block w-full text-left px-3 py-1 hover:bg-gray-100 text-sm">Size {s}</button>
                            ))}
                        </div>
                    </div>
                    <div className="relative group">
                        <TBtn label="Paragraph" arrow className="w-24 justify-between"/>
                        <div className="absolute top-full left-0 bg-white border shadow-lg hidden group-hover:block w-40 py-1 z-50">
                            {['H1', 'H2', 'H3', 'P', 'BLOCKQUOTE'].map(tag => (
                                <button key={tag} onMouseDown={e => {e.preventDefault(); execCmd('formatBlock', tag)}} className="block w-full text-left px-3 py-1 hover:bg-gray-100 text-sm font-medium">
                                    {tag === 'H1' ? 'Major Heading' : tag === 'H2' ? 'Heading' : tag === 'P' ? 'Paragraph' : 'Quote'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. Text & Highlight Colors */}
                <div className="flex border-r border-gray-200 px-1 gap-0.5">
                    <TBtn onClick={() => execCmd('bold')} icon={<Bold size={15}/>} tip="Bold" />
                    <TBtn onClick={() => execCmd('italic')} icon={<Italic size={15}/>} tip="Italic" />
                    <TBtn onClick={() => execCmd('underline')} icon={<Underline size={15}/>} tip="Underline" />
                    
                    {/* Text Color Dropdown */}
                    <div className="relative group">
                        <TBtn icon={<Palette size={15}/>} tip="Text Color" arrow />
                        <div className="absolute top-full left-0 bg-white border p-3 shadow-xl hidden group-hover:block w-48 z-50 rounded-lg">
                            <p className="text-xs font-bold text-gray-400 mb-2 uppercase">Presets</p>
                            <div className="grid grid-cols-5 gap-2 mb-3">
                                {colorPresets.map(c => (
                                    <button key={c} onMouseDown={e => {e.preventDefault(); execCmd('foreColor', c)}} className="w-6 h-6 rounded-full border border-gray-200 shadow-sm hover:scale-110 transition-transform" style={{background: c}} />
                                ))}
                            </div>
                            <div className="border-t pt-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer hover:text-purple-600">
                                    <div className="relative w-6 h-6 rounded-full overflow-hidden border border-gray-300">
                                        <input type="color" className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer" onChange={e => execCmd('foreColor', e.target.value)} />
                                    </div>
                                    Custom Color
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Highlighter Dropdown */}
                    <div className="relative group">
                        <TBtn icon={<Highlighter size={15}/>} tip="Highlight Color" arrow />
                        <div className="absolute top-full left-0 bg-white border p-3 shadow-xl hidden group-hover:block w-48 z-50 rounded-lg">
                            <p className="text-xs font-bold text-gray-400 mb-2 uppercase">Background</p>
                            <div className="grid grid-cols-5 gap-2 mb-3">
                                {colorPresets.map(c => (
                                    <button key={c} onMouseDown={e => {e.preventDefault(); execCmd('hiliteColor', c)}} className="w-6 h-6 rounded-sm border border-gray-200 shadow-sm hover:scale-110 transition-transform" style={{background: c}} />
                                ))}
                            </div>
                            <div className="border-t pt-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer hover:text-purple-600">
                                    <div className="relative w-6 h-6 rounded-sm overflow-hidden border border-gray-300">
                                        <input type="color" className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer" onChange={e => execCmd('hiliteColor', e.target.value)} />
                                    </div>
                                    Custom Highlight
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Link & Image */}
                <div className="flex border-r border-gray-200 px-1 gap-0.5">
                    <TBtn onClick={openLinkModal} icon={<LinkIcon size={15}/>} tip="Insert Link" label="Link"/>
                    <label className="flex items-center justify-center p-1.5 hover:bg-gray-100 rounded cursor-pointer relative">
                       {uploadingImg ? <Loader size={15} className="animate-spin"/> : <ImageIcon size={15}/>}
                       <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                </div>

                {/* 5. Align & Lists */}
                <div className="flex border-r border-gray-200 px-1 gap-0.5">
                    <TBtn onClick={() => execCmd('justifyLeft')} icon={<AlignLeft size={15}/>} />
                    <TBtn onClick={() => execCmd('justifyCenter')} icon={<AlignCenter size={15}/>} />
                    <TBtn onClick={() => execCmd('justifyRight')} icon={<AlignRight size={15}/>} />
                    <TBtn onClick={() => execCmd('justifyFull')} icon={<AlignJustify size={15}/>} />
                </div>

                {/* 6. Misc */}
                <div className="flex px-1 gap-0.5">
                    <TBtn onClick={() => execCmd('insertUnorderedList')} icon={<List size={15}/>} />
                    <TBtn onClick={() => execCmd('insertOrderedList')} icon={<ListOrdered size={15}/>} />
                    <TBtn onClick={() => execCmd('formatBlock', 'BLOCKQUOTE')} icon={<Quote size={15}/>} />
                    <TBtn onClick={() => execCmd('insertHorizontalRule')} icon={<Minus size={15}/>} />
                </div>
            </div>

            {/* EDITOR AREA */}
            <div className="flex-1 bg-[#E8EAED] p-4 md:p-8 overflow-y-auto" onClick={handleEditorClick}>
                <div 
                    ref={editorRef}
                    className="bg-white max-w-[800px] min-h-[800px] mx-auto shadow-md p-10 outline-none prose prose-lg prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-md"
                    contentEditable
                    suppressContentEditableWarning={true}
                    style={{ fontFamily: 'Arial, sans-serif' }}
                ></div>
            </div>

            {/* FLOATING IMAGE TOOLBAR */}
            {selectedImg && (
                <div 
                    className="absolute bg-white shadow-xl border border-gray-300 rounded flex items-center p-1 gap-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    style={{ top: imgToolbarPos.top, left: imgToolbarPos.left }}
                >
                    <div className="flex border-r border-gray-200 pr-2 gap-1">
                        <TBtn onClick={() => updateImage({float:'left', margin:'0 15px 10px 0'})} icon={<AlignLeft size={14}/>} tip="Float Left" />
                        <TBtn onClick={() => updateImage({float:'none', display:'block', margin:'10px auto'})} icon={<AlignCenter size={14}/>} tip="Center" />
                        <TBtn onClick={() => updateImage({float:'right', margin:'0 0 10px 15px'})} icon={<AlignRight size={14}/>} tip="Float Right" />
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-600 border-r border-gray-200 pr-2">
                        <button onClick={() => updateImage({width:'50%'})} className="hover:text-blue-600">M</button>
                        <button onClick={() => updateImage({width:'100%'})} className="hover:text-blue-600">XL</button>
                    </div>
                    <button onClick={toggleCaption} className="text-xs font-medium hover:bg-gray-100 px-2 py-1 rounded">Caption</button>
                    <button onClick={() => {selectedImg.remove(); setSelectedImg(null);}} className="text-red-500 hover:bg-red-50 p-1 rounded"><X size={14}/></button>
                </div>
            )}

         </div>

         {/* RIGHT: SIDEBAR */}
         <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-y-auto hidden md:flex">
            <div className="p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-500 text-xs uppercase tracking-wide">Post settings</h3>
            </div>

            <Accordion title="Post Details" isOpen={sidebarOpen.details} onToggle={() => setSidebarOpen(p => ({...p, details: !p.details}))}>
                <label className="block text-xs font-bold text-gray-500 mb-1">Category</label>
                <select className="w-full p-2 border rounded bg-gray-50 text-sm focus:border-purple-500 outline-none mb-3" value={settings.category} onChange={e => setSettings({...settings, category: e.target.value})}>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>

                <label className="block text-xs font-bold text-gray-500 mb-1">Published By</label>
                <input 
                    type="text" 
                    className="w-full p-2 border rounded text-sm bg-gray-50 outline-none focus:border-purple-500 mb-3" 
                    value={settings.author} 
                    onChange={e => setSettings({...settings, author: e.target.value})}
                    placeholder="Author Name"
                />

                <div className="flex items-center gap-2">
                    <input type="checkbox" checked={settings.isEditorial} onChange={e => setSettings({...settings, isEditorial: e.target.checked})} className="accent-purple-500"/>
                    <span className="text-sm text-gray-700">Editorial Choice</span>
                </div>
            </Accordion>

            <Accordion title="Published on" isOpen={sidebarOpen.published} onToggle={() => setSidebarOpen(p => ({...p, published: !p.published}))}>
                <input type="datetime-local" className="w-full p-2 border rounded text-sm bg-gray-50 outline-none" value={settings.publishedDate} onChange={e => setSettings({...settings, publishedDate: e.target.value})} />
            </Accordion>

            <Accordion title="Permalink" isOpen={sidebarOpen.permalink} onToggle={() => setSidebarOpen(p => ({...p, permalink: !p.permalink}))}>
                <div className="flex items-center gap-2 mb-2">
                    <input type="radio" checked readOnly className="accent-purple-500" />
                    <span className="text-sm text-gray-700">Automatic Permalink</span>
                </div>
                <div className="text-xs text-gray-400 bg-gray-50 p-2 border break-all rounded">
                    /blogs/{title.toLowerCase().replace(/\s+/g, '-') || 'untitled'}
                </div>
            </Accordion>

            <Accordion title="Location" isOpen={sidebarOpen.location} onToggle={() => setSidebarOpen(p => ({...p, location: !p.location}))}>
                <input type="text" placeholder="Search location" className="w-full p-2 border rounded text-sm bg-gray-50 outline-none" value={settings.location} onChange={e => setSettings({...settings, location: e.target.value})} />
            </Accordion>

            <Accordion title="Options" isOpen={sidebarOpen.options} onToggle={() => setSidebarOpen(p => ({...p, options: !p.options}))}>
                <p className="text-xs font-bold text-gray-500 mb-2">Reader comments</p>
                <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input type="radio" name="comments" checked={settings.allowComments} onChange={() => setSettings({...settings, allowComments: true})} className="accent-purple-500"/> Allow
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input type="radio" name="comments" checked={!settings.allowComments} onChange={() => setSettings({...settings, allowComments: false})} className="accent-purple-500"/> Do not allow
                    </label>
                </div>
            </Accordion>
         </div>
      </div>

      {/* --- LINK MODAL --- */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[100]">
            <div className="bg-white rounded shadow-xl w-96 p-6 animate-in fade-in zoom-in-95 duration-200">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Edit Link</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Text to display</label>
                        <input 
                            type="text" 
                            className="w-full border-b-2 border-gray-200 focus:border-purple-500 outline-none py-1 text-sm transition-colors"
                            value={linkData.text}
                            onChange={(e) => setLinkData({...linkData, text: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Paste or search for a link</label>
                        <input 
                            type="text" 
                            className="w-full border-b-2 border-gray-200 focus:border-purple-500 outline-none py-1 text-sm transition-colors"
                            value={linkData.url}
                            onChange={(e) => setLinkData({...linkData, url: e.target.value})}
                            placeholder="https://example.com"
                            autoFocus
                        />
                    </div>
                    <div className="space-y-2 pt-2">
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input type="checkbox" checked={linkData.targetBlank} onChange={e => setLinkData({...linkData, targetBlank: e.target.checked})} className="rounded accent-purple-500"/>
                            Open this link in a new window
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input type="checkbox" checked={linkData.noFollow} onChange={e => setLinkData({...linkData, noFollow: e.target.checked})} className="rounded accent-purple-500"/>
                            Add 'rel=nofollow' attribute
                        </label>
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={() => setShowLinkModal(false)} className="px-4 py-2 text-gray-600 font-bold text-sm hover:bg-gray-100 rounded">CANCEL</button>
                    <button onClick={applyLink} className="px-4 py-2 text-purple-600 font-bold text-sm hover:bg-purple-50 rounded">APPLY</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}

// --- SUB COMPONENTS ---

const TBtn = ({ onClick, icon, tip, label, arrow, className }) => (
    <button 
        onClick={onClick} 
        title={tip} 
        className={`flex items-center justify-center p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors ${label ? 'gap-1 px-2' : ''} ${className}`}
        onMouseDown={e => e.preventDefault()} 
    >
        {icon}
        {label && <span className="text-xs font-medium">{label}</span>}
        {arrow && <ChevronDown size={12} className="ml-0.5 opacity-50"/>}
    </button>
);

const Accordion = ({ title, isOpen, onToggle, children }) => (
    <div className="border-b border-gray-100">
        <button 
            onClick={onToggle}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
        >
            <span className="text-sm font-medium text-gray-600">{title}</span>
            {isOpen ? <ChevronUp size={16} className="text-gray-400"/> : <ChevronDown size={16} className="text-gray-400"/>}
        </button>
        {isOpen && (
            <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-1 duration-200">
                {children}
            </div>
        )}
    </div>
);