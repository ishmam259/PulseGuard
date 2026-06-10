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
  claude: 'https://cdn.simpleicons.org/claude',
  openai: 'https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/openai.svg',
  wearos: 'https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/wearos.svg',
  applehealth: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
  spike: 'https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/quicklook.svg', // Representative icon for Spike
  hopper: 'https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/wearos.svg'
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
      finished: 'Finished Setup',
      desktopApps: 'Desktop IDEs',
      wearableApps: 'Smartwatch & Wearables',
      hopper: 'Hopper (Wear OS)',
      hopperDesc: 'Native MCP on your wrist',
      openWear: 'Open Wearables',
      openWearDesc: 'Apple, Garmin, Polar, Whoop',
      spike: 'Spike MCP',
      spikeDesc: 'Unified Biometric & Glucose',
      claudeGpt: 'Claude / ChatGPT',
      claudeGptDesc: 'Web/Desktop with Health Plugins'
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
      finished: 'সেটআপ সম্পন্ন',
      desktopApps: 'ডেস্কটপ আইডিই',
      wearableApps: 'স্মার্টওয়াচ এবং ওয়্যারেবলস',
      hopper: 'Hopper (Wear OS)',
      hopperDesc: 'কবজিতেই সরাসরি MCP সাপোর্ট',
      openWear: 'Open Wearables',
      openWearDesc: 'অ্যাপল, গারমিন, পোলার, হুপ',
      spike: 'Spike MCP',
      spikeDesc: 'একীভূত বায়োমেট্রিক ও গ্লুকোজ',
      claudeGpt: 'Claude / ChatGPT',
      claudeGptDesc: 'হেলথ প্লাগইন সহ ওয়েব/ডেস্কটপ'
    }
  }[locale] || {
    en: {},
    bn: {}
  }

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Left Column: Token & Access */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
            </div>

            <p style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-muted)', marginBottom: '12px' }}>
              {locale === 'bn' ? 'সার্ভার ইউআরএল' : 'Server URL'}
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <code style={{ flex: 1, backgroundColor: 'var(--color-surface)', padding: '12px', borderRadius: '12px', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', border: '1px solid var(--color-border)', color: 'var(--color-text)', fontWeight: '500' }}>
                {mcpUrl}
              </code>
              <button onClick={() => copyToClipboard(mcpUrl, 'url-main')} className="btn--icon" style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'var(--color-surface)' }}>
                {copied === 'url-main' ? <Check className="h-5 w-5 color-success" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
            
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '16px', lineHeight: '1.4' }}>
              {locale === 'bn' 
                ? 'এই ইউআরএল এবং টোকেন ব্যবহার করে যে কোনো এমসিপি (MCP) সাপোর্টেড অ্যাপে পালসগার্ড যুক্ত করুন।' 
                : 'Use this URL and Token to connect PulseGuard to any MCP-enabled application.'}
            </p>
          </div>
        </div>

        {/* Right Column: Categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Desktop IDEs */}
          <div>
            <h5 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal className="h-4 w-4" />
              {content.desktopApps}
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Cursor */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', backgroundColor: 'var(--color-primary-dim)', borderRadius: '14px', border: '1px solid var(--color-primary-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={LOGOS.cursor} alt="Cursor" style={{ height: '22px', width: '22px' }} />
                  <div>
                    <p style={{ fontWeight: '700', color: 'var(--color-text)', margin: '0', fontSize: '14px' }}>Cursor IDE</p>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '0' }}>{content.oneClick}</p>
                  </div>
                </div>
                <a href={cursorDeepLink} className="btn btn--primary" style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '99px' }}>
                  {content.connect}
                </a>
              </div>

              {/* VS Code */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', backgroundColor: 'var(--color-surface)', borderRadius: '14px', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={LOGOS.vscode} alt="VS Code" style={{ height: '22px', width: '22px' }} />
                  <p style={{ fontWeight: '600', color: 'var(--color-text)', margin: '0', fontSize: '14px' }}>VS Code</p>
                </div>
                <button onClick={() => setActiveModal('vscode')} className="btn" style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '99px', backgroundColor: 'var(--color-surface-dim)', border: '1px solid var(--color-border)' }}>
                  {content.setup}
                </button>
              </div>

              {/* Claude Desktop */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', backgroundColor: 'var(--color-surface)', borderRadius: '14px', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={LOGOS.claude} alt="Claude" style={{ height: '22px', width: '22px' }} />
                  <p style={{ fontWeight: '600', color: 'var(--color-text)', margin: '0', fontSize: '14px' }}>Claude Desktop</p>
                </div>
                <button onClick={() => setActiveModal('claude')} className="btn" style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '99px', backgroundColor: 'var(--color-surface-dim)', border: '1px solid var(--color-border)' }}>
                  {content.setup}
                </button>
              </div>
            </div>
          </div>

          {/* Wearables */}
          <div>
            <h5 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Box className="h-4 w-4" />
              {content.wearableApps}
            </h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {/* Hopper */}
              <div style={{ padding: '14px', backgroundColor: 'var(--color-surface)', borderRadius: '14px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={LOGOS.hopper} alt="Hopper" style={{ height: '18px', width: '18px' }} />
                  <p style={{ fontWeight: '700', color: 'var(--color-text)', margin: '0', fontSize: '13px' }}>Hopper</p>
                </div>
                <p style={{ fontSize: '10px', color: 'var(--color-text-secondary)', margin: '0', lineHeight: '1.3' }}>{content.hopperDesc}</p>
              </div>

              {/* Open Wearables */}
              <div style={{ padding: '14px', backgroundColor: 'var(--color-surface)', borderRadius: '14px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={LOGOS.applehealth} alt="Apple Health" style={{ height: '18px', width: '18px' }} />
                  <p style={{ fontWeight: '700', color: 'var(--color-text)', margin: '0', fontSize: '13px' }}>Open Wearables</p>
                </div>
                <p style={{ fontSize: '10px', color: 'var(--color-text-secondary)', margin: '0', lineHeight: '1.3' }}>{content.openWearDesc}</p>
              </div>

              {/* Spike MCP */}
              <div style={{ padding: '14px', backgroundColor: 'var(--color-surface)', borderRadius: '14px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ backgroundColor: 'var(--color-primary)', borderRadius: '4px', padding: '2px' }}>
                    <Check className="h-3 w-3" style={{ color: 'white' }} />
                  </div>
                  <p style={{ fontWeight: '700', color: 'var(--color-text)', margin: '0', fontSize: '13px' }}>Spike MCP</p>
                </div>
                <p style={{ fontSize: '10px', color: 'var(--color-text-secondary)', margin: '0', lineHeight: '1.3' }}>{content.spikeDesc}</p>
              </div>

              {/* Claude / ChatGPT */}
              <div style={{ padding: '14px', backgroundColor: 'var(--color-surface)', borderRadius: '14px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '-4px' }}>
                    <img src={LOGOS.claude} alt="Claude" style={{ height: '16px', width: '16px', marginRight: '-4px', position: 'relative', zIndex: 2 }} />
                    <img src={LOGOS.openai} alt="ChatGPT" style={{ height: '16px', width: '16px', position: 'relative', zIndex: 1 }} />
                  </div>
                  <p style={{ fontWeight: '700', color: 'var(--color-text)', margin: '0', fontSize: '13px' }}>Claude / GPT</p>
                </div>
                <p style={{ fontSize: '10px', color: 'var(--color-text-secondary)', margin: '0', lineHeight: '1.3' }}>{content.claudeGptDesc}</p>
              </div>
            </div>
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
