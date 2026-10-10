import { useState } from "react";
import { Legend } from "./Legend";
import { RankingTable } from "./RankingTable";
import { ResultDetails } from "./ResultDetails";
import type { ColorScheme } from "../theme";
import type { FinalResponse } from "../types";
import "./analysis-result.css";

type PanelView = "overview" | "evidence";

interface Props {
  result: FinalResponse;
  scheme: ColorScheme;
  hoveredKey: string | null;
  onHover: (key: string | null) => void;
}

/** 백엔드 계산 결과를 그대로 표시한다. 지표·순위·구간을 프런트에서 재계산하지 않는다. */
export function AnalysisResultPanel({ result, scheme, hoveredKey, onHover }: Props) {
  const [view, setView] = useState<PanelView>("overview");

  return (
    <div className="analysis-result">
      <div className="analysis-view-switch" role="group" aria-label="분석 결과 화면 선택">
        <button
          type="button"
          className={view === "overview" ? "active" : undefined}
          aria-pressed={view === "overview"}
          onClick={() => setView("overview")}
        >
          결과·순위
        </button>
        <button
          type="button"
          className={view === "evidence" ? "active" : undefined}
          aria-pressed={view === "evidence"}
          onClick={() => setView("evidence")}
        >
          분석 근거
        </button>
      </div>

      {view === "overview" ? (
        <>
          <section className="card analysis-summary-card" aria-label="분석 요약">
            <p className="analysis-eyebrow">ANALYSIS SUMMARY</p>
            <p className="analysis-question">{result.question}</p>
            <h3>분석 결과</h3>
            <p className="analysis-summary-text">{result.summary}</p>
            <div className="analysis-primary-metric">
              <span className="analysis-metric-title">분석 지표</span>
              <strong>{result.metric.label}</strong>
              <span>{result.metric.interpretation}</span>
            </div>
          </section>

          <div className="analysis-stats" aria-label="분석 데이터 현황">
            <div className="analysis-stat">
              <span>분석 공간 단위</span>
              <strong>{result.map_layer.feature_count.toLocaleString("ko-KR")}</strong>
            </div>
            <div className="analysis-stat">
              <span>값 없음</span>
              <strong>{result.map_layer.null_count.toLocaleString("ko-KR")}</strong>
            </div>
          </div>

          <div className="analysis-mobile-legend">
            <Legend layer={result.map_layer} scheme={scheme} />
          </div>

          {result.ranking.length > 0 ? (
            <RankingTable result={result} hoveredKey={hoveredKey} onHover={onHover} />
          ) : (
            <section className="card">
              <h3>지역 순위</h3>
              <p className="muted">이번 분석 결과에는 순위 정보가 없습니다.</p>
            </section>
          )}

          <button type="button" className="analysis-evidence-link" onClick={() => setView("evidence")}>
            데이터 출처와 분석 방법 확인 <span aria-hidden="true">→</span>
          </button>
        </>
      ) : (
        <>
          <section className="card analysis-evidence-intro">
            <h3>분석 근거</h3>
            <p className="muted">
              사용 데이터의 출처·기준 시점, 분석 방법, 가정과 한계를 확인할 수 있습니다.
            </p>
          </section>
          <ResultDetails result={result} />
        </>
      )}
    </div>
  );
}
