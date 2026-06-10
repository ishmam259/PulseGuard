import { useState } from 'react'
import { createPortal } from 'react-dom'
import { 
  Code2, 
  Terminal, 
  Copy, 
  ExternalLink, 
  Check, 
  Cpu, 
  Box, 
  MessageSquareText,
  X,
  ArrowRight,
  Info
} from 'lucide-react'
import * as api from '../services/api'

const LOGOS = {
  vscode: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Visual_Studio_Code_1.35_icon.svg',
  cursor: 'https://cdn.simpleicons.org/cursor',
  claude: 'https://cdn.simpleicons.org/claude'
}

export default function ConnectAI({ locale }) {
  const [copied, setCopied] = useState(null)
  const [activeModal, setActiveModal] = useState(null)
  
  const token = api.getToken()
  const mcpUrl = window.location.origin.includes('localhost') 
    ? 'http://localhost:5000/api/mcp' 
    : `${window.location.origin}/api/mcp`

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const cursorDeepLink = `cursor://mcp/connect?url=${encodeURIComponent(mcpUrl)}&type=sse&name=PulseGuard`

  const vsCodeConfig = JSON.stringify({
    PulseGuard: {
      url: mcpUrl,
      type: 'sse'
    }
  }, null, 2)

  const claudeConfig = JSON.stringify({
    mcpServers: {
      pulseguard: {
        url: mcpUrl
      }
    }
  }, null, 2)

  const t = {
    en: {
      setup: 'Setup',
      connect: 'Connect',
      oneClick: 'Instant Connection',
      setupGuide: 'Setup Guide',
      copy: 'Copy Config',
      vscodeHeader: 'Setup VS Code',
      claudeHeader: 'Setup Claude Desktop',
      step1: 'Step 1',
      step2: 'Step 2',
      step3: 'Step 3',
      vsStep1: 'Install the **MCP Client** extension from the VS Code Marketplace.',
      vsStep2: 'Open the MCP tab in the sidebar and click **"Add Server"**.',
      vsStep3: 'Set the Type to **SSE** and paste this URL:',
      clStep1: 'Open **Claude Desktop** on your computer.',
      clStep2: 'Go to **Settings > Connectors** and click **"Add custom connector"**.',
      clStep3: 'Paste this URL and click connect:',
      proTip: 'Pro Tip',
      copilotTip: 'If using **GitHub Copilot**, you can add this URL in the Copilot Extension settings.',
      gotIt: 'Got it!',
      finished: 'Finished Setup'
    },
    bn: {
      setup: 'সেটআপ',
      connect: 'যুক্ত করুন',
      oneClick: 'তাৎক্ষণিক সংযোগ',
      setupGuide: 'সেটআপ গাইড',
      copy: 'কনফিগ কপি করুন',
      vscodeHeader: 'VS Code সেটআপ',
      claudeHeader: 'Claude Desktop সেটআপ',
      step1: 'ধাপ ১',
      step2: 'ধাপ ২',
      step3: 'ধাপ ৩',
      vsStep1: 'VS Code মার্কেটপ্লেস থেকে **MCP Client** এক্সটেনশনটি ইনস্টল করুন।',
      vsStep2: 'সাইডবারের MCP ট্যাবে গিয়ে **"Add Server"** ক্লিক করুন।',
      vsStep3: 'Type হিসেবে **SSE** সিলেক্ট করুন এবং এই URL-টি পেস্ট করুন:',
      clStep1: 'আপনার কম্পিউটারে **Claude Desktop** অ্যাপটি খুলুন।',
      clStep2: '**Settings > Connectors**-এ গিয়ে **"Add custom connector"** ক্লিক করুন।',
      clStep3: 'এই URL-টি পেস্ট করে কানেক্ট (Connect) ক্লিক করুন:',
      proTip: 'টিপস',
      copilotTip: 'আপনি যদি **GitHub Copilot** ব্যবহার করেন, তবে এই URL-টি সরাসরি কপিলট সেটিংস-এ যোগ করতে পারেন।',
      gotIt: 'বুঝেছি',
      finished: 'সেটআপ সম্পন্ন'
    }
  }[locale] || {
    en: {},
    bn: {}
  } // Fallback check omitted for brevity but logic stands

  const content = locale === 'bn' ? t : { ...t.en, ...t }

  const renderText = (text) => {
    if (!text) return null;
    return text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  }

  const getStepNum = (n) => {
    if (locale !== 'bn') return n;
    return n.toString().split('').map(d => '০১২৩৪৫৬৭৮৯'[d] || d).join('');
  }

  return (
    <section className="card" style={{ padding: '24px', overflow: 'hidden', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <span className="tip-icon-badge" style={{ backgroundColor: 'var(--color-primary-dim)', color: 'var(--color-primary)' }}>
          <Cpu className="h-6 w-6" />
        </span>
        <div>
          <h4 className="font-display" style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0', color: 'var(--color-text)' }}>
            {locale === 'bn' ? 'এআই সহকারীর সাথে যুক্ত হোন' : 'Connect your AI Assistant'}
          </h4>
          <p className="muted" style={{ fontSize: '14px', margin: '2px 0 0 0' }}>
            {locale === 'bn' ? 'আপনার ডেটা সরাসরি আপনার প্রিয় এআই টুলে ব্যবহার করুন' : 'Let your favorite AI tools see your health data safely.'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* Connection Details */}
        <div style={{ backgroundColor: 'var(--color-surface-dim)', borderRadius: '16px', padding: '20px', border: '1px dashed var(--color-border)' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', marginBottom: '12px' }}>
            {locale === 'bn' ? 'আপনার এক্সেস টোকেন' : 'Your Access Token'}
          </p>
          
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <code style={{ flex: 1, backgroundColor: 'var(--color-surface)', padding: '12px', borderRadius: '12px', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', border: '1px solid var(--color-border)', color: 'var(--color-primary)', fontWeight: '600' }}>
                {token ? `${token.substring(0, 16)}...` : 'No token found'}
              </code>
              <button onClick={() => copyToClipboard(token, 'token')} className="btn--icon" style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'var(--color-surface)' }}>
                {copied === 'token' ? <Check className="h-5 w-5 color-success" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '10px', lineHeight: '1.4' }}>
              {locale === 'bn' 
                ? 'এআই যখন আপনার ডেটা দেখতে চাইবে, তখন এই টোকেনটি তাকে দিন।' 
                : 'Copy this token and give it to your AI assistant when it asks for authorization.'}
            </p>
          </div>
        </div>

        {/* Tools */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Cursor */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'var(--color-primary-dim)', borderRadius: '16px', border: '1px solid var(--color-primary-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={LOGOS.cursor} alt="Cursor" style={{ height: '24px', width: '24px' }} />
              <div>
                <p style={{ fontWeight: '700', color: 'var(--color-text)', margin: '0' }}>Cursor IDE</p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0' }}>{t.oneClick}</p>
              </div>
            </div>
            <a href={cursorDeepLink} className="btn btn--primary" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '99px' }}>
              {t.connect}
            </a>
          </div>

          {/* VS Code */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'var(--color-surface)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={LOGOS.vscode} alt="VS Code" style={{ height: '24px', width: '24px' }} />
              <div>
                <p style={{ fontWeight: '700', color: 'var(--color-text)', margin: '0' }}>VS Code</p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0' }}>{t.setupGuide}</p>
              </div>
            </div>
            <button onClick={() => setActiveModal('vscode')} className="btn" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '99px', backgroundColor: 'var(--color-surface-dim)', border: '1px solid var(--color-border)' }}>
              {t.setup}
            </button>
          </div>

          {/* Claude Desktop */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', backgroundColor: 'var(--color-surface)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={LOGOS.claude} alt="Claude" style={{ height: '24px', width: '24px' }} />
              <div>
                <p style={{ fontWeight: '700', color: 'var(--color-text)', margin: '0' }}>Claude Desktop</p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0' }}>{t.setupGuide}</p>
              </div>
            </div>
            <button onClick={() => setActiveModal('claude')} className="btn" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '99px', backgroundColor: 'var(--color-surface-dim)', border: '1px solid var(--color-border)' }}>
              {t.setup}
            </button>
          </div>
        </div>
      </div>

      {/* Modals - Rendered via Portal to avoid clipping */}
      {activeModal && createPortal(
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModal(null)
          }}
          style={{ 
            position: 'fixed', 
            inset: 0, 
            backgroundColor: 'rgba(0,0,0,0.75)', 
            zIndex: 9999, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '20px', 
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          <div className="card animate-scale-up" style={{ maxWidth: '500px', width: '100%', padding: '32px', position: 'relative', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.4)', border: '1px solid var(--color-border)' }}>
            <button onClick={() => setActiveModal(null)} style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-muted)', padding: '8px' }}>
              <X className="h-6 w-6" />
            </button>

            {activeModal === 'vscode' ? (
              <>
                <h3 className="font-display" style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={LOGOS.vscode} alt="" style={{ height: '32px', width: '32px' }} />
                  {t.vscodeHeader}
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ height: '24px', width: '24px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800', flexShrink: 0 }}>{getStepNum(1)}</div>
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                      {renderText(t.vsStep1)}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ height: '24px', width: '24px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800', flexShrink: 0 }}>{getStepNum(2)}</div>
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                      {renderText(t.vsStep2)}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ height: '24px', width: '24px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800', flexShrink: 0 }}>{getStepNum(3)}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.5' }}>
                        {renderText(t.vsStep3)}
                      </p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <code style={{ flex: 1, backgroundColor: 'var(--color-surface-dim)', padding: '10px', borderRadius: '8px', fontSize: '12px', border: '1px solid var(--color-border)' }}>{mcpUrl}</code>
                        <button onClick={() => copyToClipboard(mcpUrl, 'url')} className="btn--icon" style={{ backgroundColor: 'var(--color-surface-dim)' }}>
                          {copied === 'url' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '12px', padding: '16px', backgroundColor: 'var(--color-primary-dim)', borderRadius: '12px', border: '1px solid var(--color-primary-light)' }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Info className="h-4 w-4" />
                      {t.proTip}
                    </p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
                      {renderText(t.copilotTip)}
                    </p>
                  </div>

                  <button onClick={() => setActiveModal(null)} className="btn btn--primary" style={{ width: '100%', marginTop: '12px' }}>
                    {t.gotIt}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-display" style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={LOGOS.claude} alt="" style={{ height: '32px', width: '32px' }} />
                  {t.claudeHeader}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ height: '24px', width: '24px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800', flexShrink: 0 }}>{getStepNum(1)}</div>
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                      {renderText(t.clStep1)}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ height: '24px', width: '24px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800', flexShrink: 0 }}>{getStepNum(2)}</div>
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                      {renderText(t.clStep2)}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ height: '24px', width: '24px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800', flexShrink: 0 }}>{getStepNum(3)}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 12px 0', fontSize: '14px', lineHeight: '1.5' }}>
                        {renderText(t.clStep3)}
                      </p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <code style={{ flex: 1, backgroundColor: 'var(--color-surface-dim)', padding: '10px', borderRadius: '8px', fontSize: '12px', border: '1px solid var(--color-border)' }}>{mcpUrl}</code>
                        <button onClick={() => copyToClipboard(mcpUrl, 'url')} className="btn--icon" style={{ backgroundColor: 'var(--color-surface-dim)' }}>
                          {copied === 'url' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button onClick={() => setActiveModal(null)} className="btn btn--primary" style={{ width: '100%', marginTop: '12px' }}>
                    {t.finished}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </section>
  )
}
