import Link from 'next/link'
import { ArrowUp, Check, ChevronRight, ClipboardList, MessageCircle } from 'lucide-react'
import { BrandMark } from '@/components/layout/brand-mark'

export function HomeView() {
  return (
    <section className="home-view page-pad">
      <div className="welcome-block">
        <BrandMark />
        <p className="eyebrow">Asistente inteligente para tu empresa</p>
        <h1>Hola, soy <span>NormIA</span></h1>
        <p className="lead">Consulta normativa, entiende tus obligaciones y toma decisiones con más claridad.</p>
        <Link className="primary-button" href="/consulta">
          Empezar a consultar <ArrowUp size={17} />
        </Link>
      </div>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Todo en un solo lugar</p>
          <h2>¿En qué puedo ayudarte?</h2>
        </div>
      </div>
      <div className="action-grid">
        <Link className="feature-card" href="/consulta">
          <span className="feature-icon green"><MessageCircle size={21} /></span>
          <span><strong>Consulta normativa</strong><small>Pregunta sobre legislación y obligaciones</small></span>
          <ChevronRight size={18} />
        </Link>
        <Link className="feature-card" href="/diagnostico">
          <span className="feature-icon blue"><ClipboardList size={21} /></span>
          <span><strong>Diagnóstico guiado</strong><small>Evalúa el estado actual de tu empresa</small></span>
          <ChevronRight size={18} />
        </Link>
      </div>
      <div className="trust-note"><Check size={15} /> Respuestas fundamentadas en fuentes oficiales</div>
    </section>
  )
}
