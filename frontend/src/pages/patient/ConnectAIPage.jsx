import MobileLayout from '../../components/layout/MobileLayout'
import { useApp } from '../../context/AppContext'
import { patientNavItems } from '../../data/navItems'
import $ from '../../config/strings'
import ConnectAIComponent from '../../components/ConnectAI'

export default function ConnectAIPage() {
  const { connectivity, locale } = useApp()

  return (
    <MobileLayout
      title={$('NAV_P_CONNECT_AI', locale)}
      status={connectivity}
      navItems={patientNavItems(locale)}
    >
      <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
        <ConnectAIComponent locale={locale} />
        
        <div className="card" style={{ marginTop: '2rem', padding: '24px' }}>
          <h4 className="font-display" style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '12px' }}>
            {locale === 'bn' ? 'এটি কীভাবে কাজ করে?' : 'How does this work?'}
          </h4>
          <p className="muted" style={{ fontSize: '14px', lineHeight: '1.6' }}>
            {locale === 'bn' 
              ? 'মডেল কনটেক্সট প্রোটোকল (MCP) ব্যবহার করে আপনার এআই অ্যাসিস্ট্যান্ট সরাসরি পালসগার্ডের সাথে কথা বলতে পারে। আপনি যখন আপনার এআইকে কোনো স্বাস্থ্য বিষয়ক প্রশ্ন করবেন, সে আপনার বর্তমান ডেটা দেখে সঠিক উত্তর দিতে পারবে।' 
              : 'By using the Model Context Protocol (MCP), your AI assistant can talk directly to PulseGuard. When you ask your AI health-related questions, it can look at your real-time data to give you accurate, personalized answers.'}
          </p>
        </div>
      </div>
    </MobileLayout>
  )
}
