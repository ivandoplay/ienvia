import Link from 'next/link';

export default function OverviewPage() {
  return <>
    <div className="page-heading">
      <div>
        <p className="eyebrow">VISÃO GERAL</p>
        <h1>Visão geral da sua operação</h1>
        <p className="page-description">Este painel ainda não consulta métricas operacionais reais.</p>
      </div>
    </div>

    <section className="surface module-panel" aria-labelledby="getting-started-title">
      <div className="panel-heading">
        <div>
          <div className="panel-title" id="getting-started-title">Workspace sem dados de demonstração</div>
          <div className="panel-subtitle">O conteúdo operacional só será exibido quando estiver conectado a dados reais.</div>
        </div>
      </div>
      <div className="module-empty">
        <div>
          <strong>Métricas ainda não disponíveis</strong>
          <span>O resumo e os relatórios reais ainda não foram integrados. Removemos os números fictícios; esta tela não apresenta métricas inventadas como se fossem da sua conta.</span>
          <div className="page-heading-actions" style={{justifyContent:'center', marginTop:18}}>
            <Link className="primary-button" href="/canais-instancias">Configurar canais</Link>
            <Link className="secondary-button" href="/contatos">Ver contatos</Link>
          </div>
        </div>
      </div>
    </section>
  </>;
}
