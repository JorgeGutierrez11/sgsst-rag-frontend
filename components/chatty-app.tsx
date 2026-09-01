'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowUp, BarChart3, Bot, Check, ChevronRight, ClipboardList, FileText, History, Home, Info, MessageCircle, Send, Settings2, Sparkles, UserRound, X } from 'lucide-react'

type View = 'home' | 'consulta' | 'diagnostico'
type Message = { role: 'user' | 'assistant'; content: string; references?: string[] }

const examples = [
  '¿Qué obligaciones tiene mi empresa en materia de igualdad?',
  '¿Cuándo debo realizar la evaluación de riesgos psicosociales?',
  '¿Qué documentación necesito para una inspección de trabajo?',
]

function BrandMark({ small = false }: { small?: boolean }) {
  return <div className={`brand-mark ${small ? 'brand-mark-small' : ''}`} aria-hidden="true"><Sparkles size={small ? 16 : 50} strokeWidth={2.5} /></div>
}

function TopBar({ title = 'ChattyAI', onMenu }: { title?: string; onMenu?: () => void }) {
  return <header className="topbar"><button className="icon-button mobile-only" aria-label="Abrir menú" onClick={onMenu}><span className="menu-line" /><span className="menu-line" /></button><Link href="/" className="topbar-title"><BrandMark small /> <span>{title}</span></Link><button className="icon-button" aria-label="Configuración"><Settings2 size={18} /></button></header>
}

function BottomNav({ active, onNavigate }: { active: View; onNavigate: (view: View) => void }) {
  const items: { id: View; label: string; icon: typeof Home }[] = [
    { id: 'home', label: 'Inicio', icon: Home }, { id: 'consulta', label: 'Consulta', icon: MessageCircle }, { id: 'diagnostico', label: 'Diagnóstico', icon: BarChart3 },
  ]
  return <nav className="bottom-nav" aria-label="Navegación principal">{items.map(({ id, label, icon: Icon }) => <button key={id} className={active === id ? 'nav-item active' : 'nav-item'} onClick={() => onNavigate(id)} aria-current={active === id ? 'page' : undefined}><Icon size={19} /><span>{label}</span></button>)}</nav>
}

function HomeView({ onNavigate }: { onNavigate: (view: View) => void }) {
  return <section className="home-view page-pad"><div className="welcome-block"><BrandMark /><p className="eyebrow">Asistente inteligente para tu empresa</p><h1>Hola, soy <span>ChattyAI</span></h1><p className="lead">Consulta normativa, entiende tus obligaciones y toma decisiones con más claridad.</p><button className="primary-button" onClick={() => onNavigate('consulta')}>Empezar a consultar <ArrowUp size={17} /></button></div><div className="section-heading"><div><p className="eyebrow">Todo en un solo lugar</p><h2>¿En qué puedo ayudarte?</h2></div></div><div className="action-grid"><button className="feature-card" onClick={() => onNavigate('consulta')}><span className="feature-icon green"><MessageCircle size={21} /></span><span><strong>Consulta normativa</strong><small>Pregunta sobre legislación y obligaciones</small></span><ChevronRight size={18} /></button><button className="feature-card" onClick={() => onNavigate('diagnostico')}><span className="feature-icon blue"><ClipboardList size={21} /></span><span><strong>Diagnóstico guiado</strong><small>Evalúa el estado actual de tu empresa</small></span><ChevronRight size={18} /></button></div><div className="trust-note"><Check size={15} /> Respuestas fundamentadas en fuentes oficiales</div></section>
}

function ConsultaView() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const send = async (text = input) => { const value = text.trim(); if (!value || loading) return; setInput(''); setError(''); setMessages((current) => [...current, { role: 'user', content: value }]); setLoading(true); await new Promise((resolve) => setTimeout(resolve, 700)); setLoading(false); setMessages((current) => [...current, { role: 'assistant', content: 'He revisado tu consulta. Como orientación inicial, conviene identificar la normativa aplicable a tu actividad y documentar las medidas adoptadas. Esta respuesta es informativa y debe contrastarse con la fuente oficial correspondiente.', references: ['Ley 31/1995 de Prevención de Riesgos Laborales', 'Guía técnica del INSST'] }]); }
  return <section className="chat-view page-pad"><div className="chat-intro"><div className="chat-icon"><MessageCircle size={22} /></div><div><p className="eyebrow">Consulta normativa</p><h1>¿Qué necesitas saber?</h1></div></div>{messages.length === 0 ? <div className="empty-chat"><p>Haz una pregunta sobre normativa laboral, prevención o gestión de personas.</p><div className="example-list">{examples.map((example) => <button key={example} className="example-chip" onClick={() => send(example)}>{example}<ArrowUp size={15} /></button>)}</div></div> : <div className="messages" aria-live="polite">{messages.map((message, index) => <div className={`message-row ${message.role}`} key={`${message.role}-${index}`}><div className="avatar">{message.role === 'assistant' ? <Sparkles size={15} /> : <UserRound size={15} />}</div><div className="message-bubble">{message.content}{message.references && <div className="references"><p><FileText size={14} /> Fuentes consultadas</p>{message.references.map((reference, refIndex) => <button key={reference}><span>{refIndex + 1}</span>{reference}</button>)}</div>}</div></div>)}{loading && <div className="message-row assistant"><div className="avatar"><Sparkles size={15} /></div><div className="message-bubble typing"><span /><span /><span /></div></div>}</div>}{error && <p className="error-message" role="alert"><Info size={15} /> {error}<button onClick={() => setError('')} aria-label="Cerrar error"><X size={14} /></button></p>}<div className="composer-wrap"><div className="composer"><input aria-label="Escribe tu consulta" value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.nativeEvent.isComposing && event.keyCode !== 229) send() }} placeholder="Escribe tu consulta..." /><button className="send-button" onClick={() => send()} disabled={!input.trim() || loading} aria-label="Enviar consulta"><Send size={18} /></button></div><p>ChattyAI puede cometer errores. Verifica la información importante.</p></div></section>
}

function DiagnosticoView() {
  const [step, setStep] = useState(1)
  const steps = ['Empresa', 'Preguntas', 'Revisión', 'Resultado']
  return <section className="diagnostic-view page-pad"><div className="view-heading"><p className="eyebrow">Diagnóstico guiado</p><h1>Conoce el estado de tu empresa</h1><p>Responde unas preguntas y recibe una primera orientación sobre tus prioridades.</p></div><div className="stepper">{steps.map((label, index) => <div className={index + 1 <= step ? 'step active' : 'step'} key={label}><span>{index + 1 < step ? <Check size={14} /> : index + 1}</span><small>{label}</small></div>)}</div><div className="diagnostic-card">{step === 1 && <><span className="large-card-icon"><ClipboardList size={25} /></span><h2>Empecemos por lo básico</h2><p>Cuéntanos un poco sobre tu empresa para personalizar el diagnóstico.</p><label>¿Cuántas personas trabajan en tu empresa?</label><div className="choice-grid">{['1 – 9', '10 – 49', '50 – 249', '250 o más'].map((choice) => <button key={choice} onClick={() => setStep(2)}>{choice}</button>)}</div></>}{step === 2 && <><span className="large-card-icon"><MessageCircle size={25} /></span><h2>Una pregunta importante</h2><p>¿Tienes un plan de prevención de riesgos actualizado?</p><div className="choice-stack"><button onClick={() => setStep(3)}>Sí, está actualizado <Check size={17} /></button><button onClick={() => setStep(3)}>No estoy seguro <ChevronRight size={17} /></button><button onClick={() => setStep(3)}>No lo tenemos <ChevronRight size={17} /></button></div></>}{step === 3 && <><span className="large-card-icon"><Check size={25} /></span><h2>Revisa tus respuestas</h2><p>Ya tenemos suficiente información para preparar una orientación inicial.</p><button className="primary-button wide" onClick={() => setStep(4)}>Ver resultado <ArrowUp size={17} /></button></>}{step === 4 && <><span className="result-badge">Prioridad media</span><h2>Tu siguiente paso</h2><p>Te recomendamos revisar y actualizar tu plan de prevención, dejando constancia de la evaluación y de las medidas aplicadas.</p><div className="result-tip"><Sparkles size={17} /><span>Consulta a ChattyAI si necesitas ayuda para preparar la documentación.</span></div><button className="secondary-button" onClick={() => setStep(1)}>Repetir diagnóstico</button></>}</div></section>
}

export default function ChattyApp() {
  const [view, setView] = useState<View>('home')
  const [menuOpen, setMenuOpen] = useState(false)
  return <main className="app-shell"><aside className={menuOpen ? 'sidebar open' : 'sidebar'}><div className="sidebar-brand"><BrandMark small /><strong>Chatty<span>AI</span></strong></div><nav><button className={view === 'home' ? 'side-link active' : 'side-link'} onClick={() => { setView('home'); setMenuOpen(false) }}><Home size={17} /> Inicio</button><button className={view === 'consulta' ? 'side-link active' : 'side-link'} onClick={() => { setView('consulta'); setMenuOpen(false) }}><MessageCircle size={17} /> Consulta normativa</button><button className={view === 'diagnostico' ? 'side-link active' : 'side-link'} onClick={() => { setView('diagnostico'); setMenuOpen(false) }}><BarChart3 size={17} /> Diagnóstico</button></nav><div className="sidebar-foot"><div className="mini-note"><Bot size={16} /><span>Tu asistente de confianza</span></div></div></aside><div className="main-column"><TopBar title={view === 'home' ? 'ChattyAI' : view === 'consulta' ? 'Consulta normativa' : 'Diagnóstico'} onMenu={() => setMenuOpen(!menuOpen)} />{view === 'home' ? <HomeView onNavigate={setView} /> : view === 'consulta' ? <ConsultaView /> : <DiagnosticoView />}<BottomNav active={view} onNavigate={setView} /></div></main>
}
