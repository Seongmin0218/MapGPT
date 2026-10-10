import { type FormEvent, useEffect, useState } from "react";
import { requestAnalysis } from "./api";
import { ChoroplethMap } from "./components/ChoroplethMap";
import { ErrorPanel } from "./components/ErrorPanel";
import { Legend } from "./components/Legend";
import { RankingTable } from "./components/RankingTable";
import { ResultDetails } from "./components/ResultDetails";
import { useColorScheme } from "./theme";
import type { AnalysisResponse } from "./types";
import { loadDemoAnalysis } from "./demo";
import { BaseMap } from "./components/BaseMap";

const EXAMPLE = "서울에서 어린이 인구 대비 어린이집이 부족한 행정동을 알려줘.";

const DEMO_MODE =
  new URLSearchParams(window.location.search).get("demo") === "1";

function useElapsedSeconds(running: boolean): number {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) return;
    setSeconds(0);
    const timer = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, [running]);
  return seconds;
}

export function App() {
  const scheme = useColorScheme();
  const [question, setQuestion] = useState(EXAMPLE);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AnalysisResponse | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const elapsed = useElapsedSeconds(loading);
  const result = response?.result ?? null;
  const [panelOpen, setPanelOpen] = useState(true);

  useEffect(() => {
    if (!DEMO_MODE) return;

    let active = true;

    loadDemoAnalysis()
      .then((data) => {
        if (active) setResponse(data);
      })
      .catch((error) => {
        if (active) {
          setRequestError(
            error instanceof Error ? error.message : String(error)
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!question.trim() || loading) return;
    setLoading(true);
    setRequestError(null);
    try {
      setResponse(
        DEMO_MODE
          ? await loadDemoAnalysis()
          : await requestAnalysis(question.trim())
      );
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app map-first">
      {/* 전체화면 지도 */}
      <main className="map-canvas">
        {result ? (
          <ChoroplethMap
            result={result}
            scheme={scheme}
            hoveredKey={hoveredKey}
            onHover={setHoveredKey}
            panelOpen={panelOpen}
          />
        ) : (
          <BaseMap scheme={scheme} />
        )}

        {result && (
          <div className="map-legend">
            <Legend layer={result.map_layer} scheme={scheme} />
          </div>
        )}
      </main>

      <div className="map-gradient" aria-hidden="true" />

      {/* 상단 헤더 */}
      <header className="floating-header">
        <div className="brand">
          <div className="brand-mark">M</div>
          <div>
            <strong>MAPGPT</strong>
            <span>GEO SPATIAL AI</span>
          </div>
        </div>

        <button
          type="button"
          className="panel-toggle"
          onClick={() => setPanelOpen(!panelOpen)}
          aria-expanded={panelOpen}
        >
          {panelOpen ? "결과 접기" : "결과 보기"}
        </button>
      </header>

      {/* 결과 패널 */}
      {panelOpen && (
        <aside className="result-panel">
          <div className="result-panel-header">
            <div>
              <span className="eyebrow">AI ANALYSIS</span>
              <h2>공간 분석 결과</h2>
            </div>

            <button
              type="button"
              className="panel-close"
              onClick={() => setPanelOpen(false)}
              aria-label="결과 패널 닫기"
            >
              ×
            </button>
          </div>

          <div className="result-panel-content">
            {loading && (
              <section className="card progress" aria-live="polite">
                <div className="spinner" aria-hidden />
                <div>
                  <strong>분석 중… {elapsed}초</strong>
                  <p className="muted">
                    분석 결과를 준비하고 있습니다.
                  </p>
                </div>
              </section>
            )}

            {requestError && (
              <section className="card error" role="alert">
                <h2>요청을 처리하지 못했습니다</h2>
                <p>{requestError}</p>
              </section>
            )}

            {response?.status === "failed" && (
              <ErrorPanel
                errors={response.errors}
                runId={response.run_id}
              />
            )}

            {!response && !loading && !requestError && (
              <section className="card welcome-card">
                <h2>지도에서 무엇을 알아볼까요?</h2>
                <p className="muted">
                  자연어로 질문하면 공공데이터를 기반으로
                  공간 분석 결과를 지도에 표시합니다.
                </p>
              </section>
            )}

            {result && (
              <>
                <section className="card">
                  <h2>분석 요약</h2>
                  <p className="summary">{result.summary}</p>

                  <p className="metric">
                    <strong>{result.metric.label}</strong>
                    <br />
                    <span className="muted">
                      {result.metric.interpretation}
                    </span>
                  </p>
                </section>

                <div className="mobile-legend">
                  <Legend
                    layer={result.map_layer}
                    scheme={scheme}
                  />
                </div>

                <RankingTable
                  result={result}
                  hoveredKey={hoveredKey}
                  onHover={setHoveredKey}
                />

                <ResultDetails result={result} />
              </>
            )}
          </div>
        </aside>
      )}

      {/* 하단 질문창 */}
      <form className="prompt-dock" onSubmit={submit}>
        <div className="prompt-shell">
          <span className="prompt-icon" aria-hidden="true">
            ✦
          </span>

          <input
            aria-label="공간 분석 질문"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="지도에서 무엇을 찾아볼까요?"
            maxLength={500}
          />

          <button
            type="submit"
            disabled={loading || !question.trim()}
          >
            {loading ? "분석 중" : "분석"}
          </button>
        </div>

        <p className="prompt-hint">
          질문하면 답변이 아니라 지도가 만들어집니다.
        </p>
      </form>
    </div>
  );
}
