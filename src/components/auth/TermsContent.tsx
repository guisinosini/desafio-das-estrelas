import React from 'react';
import { ShieldCheck } from 'lucide-react';
import type { Language } from '@/lib/translations';

export const getConsentText1 = (lang: Language) => {
  if (lang === 'en') return 'I have read and agree to the ';
  if (lang === 'es') return 'He leído y acepto los ';
  if (lang === 'fr') return "J'ai lu et j'accepte les ";
  if (lang === 'it') return 'Ho letto e accetto i ';
  if (lang === 'zh') return '我已阅读并同意 ';
  return 'Li e concordo com os ';
};
export const getTermsLink = (lang: Language) => {
  if (lang === 'en') return 'Terms of Use';
  if (lang === 'es') return 'Términos de Uso';
  if (lang === 'fr') return "Conditions d'Utilisation";
  if (lang === 'it') return 'Termini di Utilizzo';
  if (lang === 'zh') return '使用条款';
  return 'Termos de Uso';
};
export const getConsentText2 = (lang: Language) => {
  if (lang === 'en') return ' and ';
  if (lang === 'es') return ' y las ';
  if (lang === 'fr') return ' et la ';
  if (lang === 'it') return ' e le ';
  if (lang === 'zh') return '和 ';
  return ' e as ';
};
export const getPrivacyLink = (lang: Language) => {
  if (lang === 'en') return 'Privacy Policies';
  if (lang === 'es') return 'Políticas de Privacidad';
  if (lang === 'fr') return 'Politiques de Confidentialité';
  if (lang === 'it') return 'Politiche sulla Privacy';
  if (lang === 'zh') return '隐私政策';
  return 'Políticas de Privacidade';
};
export const getConsentText3 = (lang: Language) => {
  if (lang === 'en') return '.';
  if (lang === 'es') return ' del Desafío de las Estrellas.';
  if (lang === 'fr') return ' du Défi des Étoiles.';
  if (lang === 'it') return ' della Sfida delle Stelle.';
  if (lang === 'zh') return '。';
  return ' do Desafio das Estrelas.';
};

export const getTermsModalTitle = (lang: Language) => {
  if (lang === 'en') return 'Terms of Use and Privacy';
  if (lang === 'es') return 'Términos de Uso y Privacidad';
  if (lang === 'fr') return "Conditions d'Utilisation et Confidentialité";
  if (lang === 'it') return 'Termini di Utilizzo e Privacy';
  if (lang === 'zh') return '使用条款和隐私政策';
  if (lang === 'pt-PT') return 'Termos de Utilização e Privacidade';
  return 'Termos de Uso e Privacidade';
};
export const getTermsModalSubtitle = (lang: Language) => {
  if (lang === 'en') return 'Mentor SaaS Licensing Agreement';
  if (lang === 'es') return 'Acuerdo de Licencia SaaS para Mentores';
  if (lang === 'fr') return 'Accord de Licence SaaS pour Mentors';
  if (lang === 'it') return 'Accordo di Licenza SaaS per Mentor';
  if (lang === 'zh') return '导师 SaaS 许可协议';
  return 'Contrato de Licenciamento SaaS do Mentor';
};

interface TermsContentProps {
  language: Language;
}

export const TermsContent: React.FC<TermsContentProps> = ({ language }) => {
  const isPT = language === 'pt-BR' || language === 'pt-PT';
  const isES = language === 'es';
  const isEN = language === 'en';

  if (isEN) {
    return (
      <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar text-zinc-300 text-xs md:text-sm leading-relaxed font-medium">
        <div className="flex items-start gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-emerald-400">
          <ShieldCheck className="w-6 h-6 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-300">Technical Endorsement and Responsibility</h4>
            <p className="text-[11px] font-bold">
              The Star Challenge app and its behavioral incentive algorithms are supervised by Technical Manager: Guilherme Carvalho Sinosini (CRP 06/181084).
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-white border-b border-white/5 pb-2">1. Terms of Service and SaaS Licensing</h3>
          <p>Star Challenge grants the mentor an individual, revocable, and non-exclusive license to use our educational SaaS platform.</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-zinc-400">
            <li>**Availability:** Our infrastructure is integrated with Supabase cloud servers, enjoying standard market availability SLA of 99.9%.</li>
            <li>**License Limits:** Access to administrative mentoring tools is granted on a subscription basis. Registered children limits follow the chosen active plan.</li>
            <li>**Cancellation:** The subscription can be revoked at any time directly on the Payment Portal.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-white border-b border-white/5 pb-2">2. Privacy Policy and Data Protection</h3>
          <p>We respect and protect the physical, moral, and digital integrity of minors in accordance with GDPR and international laws:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-zinc-400">
            <li>**Anonymization:** Child data is protected by encryption. The application does not require surnames or direct identification information.</li>
            <li>**Restricted Use:** All information serves exclusively for the pedagogical monitoring of the family. The app does not track, sell, or share children's data with third parties.</li>
            <li>**Clinical Reports:** Sharing data with psychologists is done solely upon active demand from the mentor, generating temporary encrypted keys.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-white border-b border-white/5 pb-2">3. Cookies Policy</h3>
          <p>To ensure GDPR compliance, we declare that the app uses cookies and local storage strictly necessary for technical operation (session, authentication, language), not used for tracking.</p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-white border-b border-white/5 pb-2">4. Medical Disclaimer</h3>
          <div className="p-4 bg-yellow-400/5 border border-yellow-400/20 rounded-2xl text-yellow-400 font-bold">
            ⚠️ "Star Challenge is a support tool for behavioral development. The data generated does not replace neurological evaluations, psychiatric diagnoses, or formal psychotherapies."
          </div>
          <p className="text-zinc-400">The app acts as a family routine facilitator based on positive reinforcement. Data interpretation must be done for pedagogical purposes.</p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-white border-b border-white/5 pb-2">5. Final Provisions</h3>
          <p>By creating an account, the mentor attests that they are the legal guardian of the registered minor and irrevocably accepts all rules and policies.</p>
        </div>
      </div>
    );
  }

  if (isES) {
    return (
      <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar text-zinc-300 text-xs md:text-sm leading-relaxed font-medium">
        <div className="flex items-start gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-emerald-400">
          <ShieldCheck className="w-6 h-6 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-300">Respaldo y Responsabilidad Técnica</h4>
            <p className="text-[11px] font-bold">
              La aplicación Desafío de las Estrellas y sus algoritmos de incentivo conductual están supervisados por el Gerente Técnico: Guilherme Carvalho Sinosini (CRP 06/181084).
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-white border-b border-white/5 pb-2">1. Términos de Servicio y Licencia SaaS</h3>
          <p>Desafío de las Estrellas otorga al mentor una licencia individual, revocable y no exclusiva para usar nuestra plataforma SaaS.</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-zinc-400">
            <li>**Disponibilidad:** Nuestra infraestructura está integrada con los servidores de Supabase, disfrutando de acuerdos SLA del 99,9%.</li>
            <li>**Límites de la Licencia:** El acceso a las herramientas se otorga mediante suscripción. Los límites de niños registrados siguen el plan activo.</li>
            <li>**Cancelación:** La suscripción puede ser revocada en cualquier momento en el Portal de Pagos.</li>
          </ul>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-white border-b border-white/5 pb-2">2. Política de Privacidad y Protección de Datos</h3>
          <p>Respetamos y protegemos la integridad de los menores de acuerdo con el GDPR y las leyes internacionales:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-zinc-400">
            <li>**Anonimato:** Los datos del niño están protegidos por encriptación. La aplicación no requiere apellidos o información de identificación directa.</li>
            <li>**Uso Restringido:** Toda la información sirve exclusivamente para el seguimiento pedagógico. La aplicación no vende ni comparte datos con terceros.</li>
            <li>**Informes Clínicos:** Compartir datos con psicólogos se realiza bajo demanda activa del mentor, generando claves cifradas temporales.</li>
          </ul>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-white border-b border-white/5 pb-2">3. Política de Cookies</h3>
          <p>Para asegurar el cumplimiento del GDPR, la aplicación utiliza cookies estrictamente necesarias para el funcionamiento técnico (sesión, idioma), no utilizadas para seguimiento publicitario.</p>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-white border-b border-white/5 pb-2">4. Descargo de Responsabilidad Médica</h3>
          <div className="p-4 bg-yellow-400/5 border border-yellow-400/20 rounded-2xl text-yellow-400 font-bold">
            ⚠️ "Desafío de las Estrellas es una herramienta de apoyo. Los datos generados no reemplazan las evaluaciones neurológicas o psicoterapias formales."
          </div>
          <p className="text-zinc-400">La aplicación actúa como un facilitador de la rutina familiar. La interpretación de datos debe realizarse con fines pedagógicos.</p>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-white border-b border-white/5 pb-2">5. Disposiciones Finales</h3>
          <p>Al crear una cuenta, el mentor certifica que es el tutor legal del menor y acepta todas las reglas y políticas.</p>
        </div>
      </div>
    );
  }

  // Fallback / Default para Português (pt-BR e pt-PT) e outras línguas por enquanto
  return (
    <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar text-zinc-300 text-xs md:text-sm leading-relaxed font-medium">
      <div className="flex items-start gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-emerald-400">
        <ShieldCheck className="w-6 h-6 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-300">Chancela e Responsabilidade Técnica</h4>
          <p className="text-[11px] font-bold">
            O aplicativo **Desafio das Estrelas** e seus algoritmos de incentivo comportamental são supervisionados pelo Responsável Técnico: **Guilherme Carvalho Sinosini (CRP 06/181084)**.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-white border-b border-white/5 pb-2">1. Termos de Uso (Terms of Service) e Licenciamento SaaS</h3>
        <p>O **Desafio das Estrelas** concede ao mentor uma licença de uso individual, revogável e não exclusiva de nossa plataforma SaaS educacional.</p>
        <ul className="list-disc list-inside space-y-1.5 pl-2 text-zinc-400">
          <li>**Disponibilidade e SLA:** Nossa infraestrutura tecnológica é integrada aos servidores em nuvem do **Supabase**, usufruindo de acordos de SLA de disponibilidade padrão de mercado de **99,9%**.</li>
          <li>**Limites da Licença:** O acesso às ferramentas administrativas de mentoria é concedido sob o regime de assinatura. Os limites de crianças cadastradas seguem estritamente o plano ativo escolhido.</li>
          <li>**Cancelamento:** A assinatura pode ser revogada ou alterada a qualquer momento, sem taxas de cancelamento, diretamente no Portal de Pagamento.</li>
        </ul>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-white border-b border-white/5 pb-2">2. Política de Privacidade (Privacy Policy) e Proteção de Dados</h3>
        <p>Respeitamos e protegemos a integridade física, moral e digital dos menores de idade de acordo com a **Lei Geral de Proteção de Dados (LGPD)** e legislações internacionais:</p>
        <ul className="list-disc list-inside space-y-1.5 pl-2 text-zinc-400">
          <li>**Anonimização e Segurança:** Os dados da criança são protegidos por criptografia. O aplicativo não requer sobrenomes, documentos ou informações de identificação direta da criança.</li>
          <li>**Uso Restrito e Não Comercialização:** Todas as informações servem exclusivamente para o monitoramento pedagógico da própria família. O aplicativo **não monitora, não rastreia, não vende e não compartilha** dados das crianças com terceiros.</li>
          <li>**Relatórios Clínicos:** O compartilhamento de dados com psicólogos ou médicos é feito única e exclusivamente sob demanda ativa do mentor, gerando chaves temporárias criptografadas.</li>
        </ul>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-white border-b border-white/5 pb-2">3. Política de Cookies</h3>
        <p>Para garantir conformidade com a LGPD e GDPR, declaramos que o aplicativo utiliza cookies estritamente necessários para o funcionamento técnico (sessão, autenticação, idioma), não sendo utilizados para rastreamento comportamental ou fins publicitários.</p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-white border-b border-white/5 pb-2">4. Isenção de Responsabilidade Médica (Medical Disclaimer)</h3>
        <div className="p-4 bg-yellow-400/5 border border-yellow-400/20 rounded-2xl text-yellow-400 font-bold">
          ⚠️ "O Desafio das Estrelas é uma ferramenta de suporte ao desenvolvimento comportamental. Os dados gerados não substituem avaliações neurológicas, diagnósticos psiquiátricos ou psicoterapias formais."
        </div>
        <p className="text-zinc-400">O aplicativo atua como facilitador de rotina familiar baseado na ciência de reforço positivo. A interpretação de dados deve ser feita com fins pedagógicos de incentivo.</p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-white border-b border-white/5 pb-2">5. Disposições Finais</h3>
        <p>Ao criar a sua conta e utilizar o Desafio das Estrelas, o mentor atesta que é o responsável legal do menor cadastrado e aceita de forma irrevogável todas as regras e políticas descritas neste instrumento.</p>
      </div>
    </div>
  );
};
