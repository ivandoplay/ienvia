import { ModulePage } from '@/components/module-page';

export default function ReportsPage() {
  return <>
    <ModulePage
      title="Relatórios"
      description="Indicadores de atendimento calculados a partir de eventos reais do workspace."
    />
    <section className="surface module-panel">
      <div className="module-empty">
        <div>
          <strong>Relatórios reais ainda não estão disponíveis</strong>
          <span>As métricas, fórmulas e períodos ainda não estão conectados ao banco. Removemos os números de demonstração para não confundi-los com os dados da sua conta.</span>
        </div>
      </div>
    </section>
  </>;
}
