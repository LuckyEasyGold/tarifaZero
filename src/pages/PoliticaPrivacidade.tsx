import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, Scale } from 'lucide-react';

export default function PoliticaPrivacidade() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'privacidade' | 'termos' | 'lgpd'>('privacidade');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Políticas e Termos</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-[72px] z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('privacidade')}
              className={`py-3 px-4 border-b-2 font-medium transition whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'privacidade'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600'
              }`}
            >
              <Shield size={18} />
              Privacidade
            </button>
            <button
              onClick={() => setActiveTab('termos')}
              className={`py-3 px-4 border-b-2 font-medium transition whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'termos'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600'
              }`}
            >
              <FileText size={18} />
              Termos de Uso
            </button>
            <button
              onClick={() => setActiveTab('lgpd')}
              className={`py-3 px-4 border-b-2 font-medium transition whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'lgpd'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600'
              }`}
            >
              <Scale size={18} />
              LGPD
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {activeTab === 'privacidade' && <PrivacidadeContent />}
          {activeTab === 'termos' && <TermosContent />}
          {activeTab === 'lgpd' && <LGPDContent />}
        </div>
      </div>
    </div>
  );
}

function PrivacidadeContent() {
  return (
    <div className="prose prose-sm max-w-none">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Política de Privacidade</h2>
      <p className="text-gray-600 mb-4">
        <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
      </p>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">1. Introdução</h3>
      <p className="text-gray-700 leading-relaxed mb-4">
        O <strong>Tarifa Zero</strong> é um aplicativo colaborativo de mapeamento de rotas de transporte público 
        em Palmas - TO. Esta Política de Privacidade descreve como coletamos, usamos e protegemos seus dados.
      </p>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">2. Dados Coletados</h3>
      <p className="text-gray-700 leading-relaxed mb-2">Coletamos os seguintes dados:</p>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
        <li><strong>Localização GPS:</strong> Coordenadas geográficas quando você está contribuindo ativamente</li>
        <li><strong>Apelido (opcional):</strong> Nome ou apelido fornecido voluntariamente</li>
        <li><strong>Dados de uso:</strong> Horários de contribuição, pontos coletados, estatísticas</li>
        <li><strong>ID anônimo:</strong> Identificador único gerado automaticamente no seu dispositivo</li>
      </ul>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">3. Como Usamos Seus Dados</h3>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
        <li>Mapear rotas de ônibus de forma colaborativa</li>
        <li>Calcular horários e posições estimadas dos veículos</li>
        <li>Gerar estatísticas agregadas e anônimas</li>
        <li>Melhorar a experiência do aplicativo</li>
        <li>Sistema de gamificação (pontos, ranking, badges)</li>
      </ul>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">4. Compartilhamento de Dados</h3>
      <p className="text-gray-700 leading-relaxed mb-4">
        <strong>NÃO compartilhamos</strong> seus dados pessoais com terceiros. Todos os dados são:
      </p>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
        <li>Armazenados de forma anônima</li>
        <li>Usados apenas para fins de mapeamento colaborativo</li>
        <li>Agregados em estatísticas sem identificação individual</li>
      </ul>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">5. Seus Direitos</h3>
      <p className="text-gray-700 leading-relaxed mb-2">Você tem direito a:</p>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
        <li>Parar de contribuir a qualquer momento</li>
        <li>Solicitar exclusão dos seus dados</li>
        <li>Acessar os dados coletados sobre você</li>
        <li>Revogar seu consentimento</li>
      </ul>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">6. Segurança</h3>
      <p className="text-gray-700 leading-relaxed mb-4">
        Implementamos medidas de segurança para proteger seus dados, incluindo criptografia 
        de dados em trânsito e armazenamento seguro em servidores confiáveis.
      </p>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">7. Contato</h3>
      <p className="text-gray-700 leading-relaxed mb-4">
        Para questões sobre privacidade, entre em contato: <strong>contato@tarifazero.com.br</strong>
      </p>
    </div>
  );
}

function TermosContent() {
  return (
    <div className="prose prose-sm max-w-none">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Termos de Uso</h2>
      <p className="text-gray-600 mb-4">
        <strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}
      </p>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">1. Aceitação dos Termos</h3>
      <p className="text-gray-700 leading-relaxed mb-4">
        Ao usar o <strong>Tarifa Zero</strong>, você concorda com estes Termos de Uso. 
        Se não concordar, não use o aplicativo.
      </p>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">2. Descrição do Serviço</h3>
      <p className="text-gray-700 leading-relaxed mb-4">
        O Tarifa Zero é uma plataforma colaborativa para mapeamento de rotas de transporte público. 
        O serviço depende da contribuição voluntária de usuários e não garante precisão absoluta das informações.
      </p>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">3. Uso Aceitável</h3>
      <p className="text-gray-700 leading-relaxed mb-2">Você concorda em:</p>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
        <li>Fornecer dados de localização precisos e verdadeiros</li>
        <li>Não usar o aplicativo para fins ilegais ou não autorizados</li>
        <li>Não tentar acessar sistemas ou dados não autorizados</li>
        <li>Não enviar dados falsos ou enganosos intencionalmente</li>
        <li>Respeitar outros usuários e colaboradores</li>
      </ul>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">4. Contribuições</h3>
      <p className="text-gray-700 leading-relaxed mb-4">
        Ao contribuir com dados de localização, você concede ao Tarifa Zero uma licença 
        não exclusiva, gratuita e perpétua para usar esses dados para fins de mapeamento 
        e melhoria do serviço.
      </p>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">5. Isenção de Responsabilidade</h3>
      <p className="text-gray-700 leading-relaxed mb-4">
        O serviço é fornecido "como está". Não garantimos:
      </p>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
        <li>Precisão absoluta das rotas e horários</li>
        <li>Disponibilidade ininterrupta do serviço</li>
        <li>Ausência de erros ou bugs</li>
      </ul>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">6. Limitação de Responsabilidade</h3>
      <p className="text-gray-700 leading-relaxed mb-4">
        O Tarifa Zero não se responsabiliza por:
      </p>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
        <li>Atrasos ou problemas no transporte público</li>
        <li>Decisões tomadas com base nas informações do aplicativo</li>
        <li>Danos indiretos ou consequenciais do uso do serviço</li>
      </ul>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">7. Modificações</h3>
      <p className="text-gray-700 leading-relaxed mb-4">
        Reservamos o direito de modificar estes termos a qualquer momento. 
        Mudanças significativas serão notificadas no aplicativo.
      </p>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">8. Lei Aplicável</h3>
      <p className="text-gray-700 leading-relaxed mb-4">
        Estes termos são regidos pelas leis brasileiras, especialmente a Lei Geral de Proteção de Dados (LGPD).
      </p>
    </div>
  );
}

function LGPDContent() {
  return (
    <div className="prose prose-sm max-w-none">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Conformidade com a LGPD</h2>
      <p className="text-gray-600 mb-4">
        Lei Geral de Proteção de Dados (Lei nº 13.709/2018)
      </p>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">1. Base Legal</h3>
      <p className="text-gray-700 leading-relaxed mb-4">
        O tratamento dos seus dados pessoais é baseado no seu <strong>consentimento explícito</strong> 
        (Art. 7º, I da LGPD) e no <strong>legítimo interesse</strong> para melhoria do serviço público 
        (Art. 7º, IX da LGPD).
      </p>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">2. Finalidade do Tratamento</h3>
      <p className="text-gray-700 leading-relaxed mb-2">
        Seus dados são tratados exclusivamente para:
      </p>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
        <li>Mapeamento colaborativo de rotas de transporte público</li>
        <li>Cálculo de horários e posições estimadas</li>
        <li>Geração de estatísticas agregadas e anônimas</li>
        <li>Melhoria da mobilidade urbana em Palmas - TO</li>
      </ul>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">3. Seus Direitos (Art. 18 da LGPD)</h3>
      <p className="text-gray-700 leading-relaxed mb-2">Você tem direito a:</p>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
        <li><strong>Confirmação:</strong> Saber se tratamos seus dados</li>
        <li><strong>Acesso:</strong> Acessar seus dados pessoais</li>
        <li><strong>Correção:</strong> Corrigir dados incompletos ou desatualizados</li>
        <li><strong>Anonimização:</strong> Solicitar anonimização dos dados</li>
        <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
        <li><strong>Eliminação:</strong> Solicitar exclusão dos dados</li>
        <li><strong>Revogação:</strong> Revogar seu consentimento a qualquer momento</li>
        <li><strong>Oposição:</strong> Se opor ao tratamento dos dados</li>
      </ul>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">4. Dados Sensíveis</h3>
      <p className="text-gray-700 leading-relaxed mb-4">
        <strong>NÃO coletamos</strong> dados sensíveis como origem racial, convicções religiosas, 
        opiniões políticas, dados de saúde ou biométricos.
      </p>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">5. Compartilhamento</h3>
      <p className="text-gray-700 leading-relaxed mb-4">
        Seus dados <strong>NÃO são compartilhados</strong> com terceiros, exceto:
      </p>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
        <li>Quando exigido por lei ou ordem judicial</li>
        <li>Em formato agregado e anônimo para pesquisas públicas</li>
      </ul>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">6. Armazenamento</h3>
      <p className="text-gray-700 leading-relaxed mb-4">
        Seus dados são armazenados em servidores seguros localizados no Brasil, 
        em conformidade com a LGPD. Mantemos os dados apenas pelo tempo necessário 
        para as finalidades descritas.
      </p>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">7. Segurança</h3>
      <p className="text-gray-700 leading-relaxed mb-4">
        Implementamos medidas técnicas e organizacionais para proteger seus dados:
      </p>
      <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
        <li>Criptografia de dados em trânsito (HTTPS/TLS)</li>
        <li>Controle de acesso restrito</li>
        <li>Monitoramento de segurança</li>
        <li>Backups regulares</li>
      </ul>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">8. Encarregado de Dados (DPO)</h3>
      <p className="text-gray-700 leading-relaxed mb-4">
        Para exercer seus direitos ou esclarecer dúvidas sobre tratamento de dados:
      </p>
      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <p className="text-gray-700">
          <strong>Email:</strong> dpo@tarifazero.com.br<br/>
          <strong>Prazo de resposta:</strong> Até 15 dias úteis
        </p>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">9. Autoridade Nacional</h3>
      <p className="text-gray-700 leading-relaxed mb-4">
        Você pode registrar reclamações na Autoridade Nacional de Proteção de Dados (ANPD):
      </p>
      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <p className="text-gray-700">
          <strong>Site:</strong> <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.gov.br/anpd</a><br/>
          <strong>Email:</strong> atendimento@anpd.gov.br
        </p>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">10. Menores de Idade</h3>
      <p className="text-gray-700 leading-relaxed mb-4">
        O aplicativo pode ser usado por menores de 18 anos, mas recomendamos supervisão 
        de pais ou responsáveis. Não coletamos intencionalmente dados de menores de 13 anos.
      </p>
    </div>
  );
}
