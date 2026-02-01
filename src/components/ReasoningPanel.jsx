import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function ReasoningPanel({
    analysis,
    comparisonItems,
    isLoading,
    onAskAboutSection,
    onSaveToHistory,
    showSavePrompt,
    setShowSavePrompt,
    onDiscard
}) {
    const [activeTab, setActiveTab] = useState('results'); // Default to Results
    const [playbackState, setPlaybackState] = useState('idle');

    // ... (rest of component code) ...

    <div className="save-prompt-actions">
        <button className="btn btn-primary" onClick={() => { onSaveToHistory(); setShowSavePrompt(false); }}>Save</button>
        <button className="btn btn-ghost" onClick={onDiscard || (() => setShowSavePrompt(false))}>Discard</button>
    </div>

    // 🎬 SYSTEM LOADING SIMULATION (Scientific/Modern)
    useEffect(() => {
        if (analysis && !isLoading) {
            setPlaybackState('init');
            const t1 = setTimeout(() => setPlaybackState('processing'), 800);
            const t2 = setTimeout(() => setPlaybackState('verifying'), 2200);
            const t3 = setTimeout(() => setPlaybackState('done'), 3000);
            return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
        }
    }, [analysis, isLoading]);

    // Loading Screen (Initial API Wait)
    if (isLoading) {
        return (
            <div className="panel reasoning-panel">
                <div className="panel-header">
                    <h2 className="panel-title">Analysis Protocol</h2>
                </div>
                <div className="panel-content centered-loading">
                    <div className="council-loader subtle">
                        <div className="pulse-ring small"></div>
                        <p className="loading-text small-grey">Initializing Neural Interface...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Empty State
    if (!analysis && comparisonItems.length === 0) {
        return (
            <div className="panel reasoning-panel">
                <div className="panel-header">
                    <h2 className="panel-title">System Ready</h2>
                </div>
                <div className="panel-content empty-content">
                    <div className="empty-state">
                        <div className="empty-icon subtle">•</div>
                        <h3 className="empty-title">Awaiting Configuration</h3>
                        <p className="empty-description">
                            Enter training parameters and execute analysis protocol.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // 🎭 PLAYBACK OVERLAY (Modern/Scientific)
    if (playbackState !== 'done' && playbackState !== 'idle') {
        return (
            <div className="panel reasoning-panel playback-mode">
                <div className="playback-container modern">
                    {playbackState === 'init' && (
                        <div className="step fade-in">
                            <h3 className="step-title">Initializing Analysis Protocol...</h3>
                            <div className="step-detail">
                                &gt; Parsing constrained architecture...<br />
                                &gt; Loading heuristic models...
                            </div>
                        </div>
                    )}
                    {playbackState === 'processing' && (
                        <div className="step fade-in">
                            <h3 className="step-title">Executing Multi-Agent Adversarial System...</h3>
                            <div className="step-detail">
                                &gt; Hardware Pessimist Module: Active<br />
                                &gt; Dynamics Optimist Module: Active<br />
                                &gt; Running parallel simulations...
                            </div>
                        </div>
                    )}
                    {playbackState === 'verifying' && (
                        <div className="step fade-in">
                            <h3 className="step-title">Synthesizing Probabilistic Models...</h3>
                            <div className="step-detail">
                                &gt; Resolving heuristic conflicts...<br />
                                &gt; Generating final report...
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const { breakdown } = analysis;
    const hasDetailedBreakdown = breakdown && breakdown.council && breakdown.council.hardware && breakdown.council.dynamics;
    const hardware = breakdown?.council?.hardware || {};
    const dynamics = breakdown?.council?.dynamics || {};

    // --- SMART PARSING LOGIC ---
    let report = {};
    const content = analysis.content || "";

    if (typeof content === 'object' && content !== null && content.verdict) {
        // 1. New JSON Pipeline - content is structured JSON
        report = content;
    } else if (typeof content === 'string' && content.length > 20) {
        // 2. Legacy Text Parser (Autofixes old reports + Manual API fails)
        // Extract Verdict
        const verdictMatch = content.match(/(?:1\.|Verdict:?)\s*\*\*?Verdict:?\*\*?:?\s*(.*?)(?=\n|2\.|Debate)/i) ||
            content.match(/(?:1\.)\s*(.*?)(?=\n|2\.)/);
        report.verdict = verdictMatch ? verdictMatch[1].trim() : "Analysis Completed.";

        // Extract Debate
        const debateMatch = content.match(/(?:2\.|Debate Summary:?)\s*\*\*?Debate Summary:?\*\*?:?\s*(.*?)(?=\n|3\.|Final)/i) ||
            content.match(/(?:2\.)\s*(.*?)(?=\n|3\.)/);
        report.debate_summary = debateMatch ? debateMatch[1].trim() : "Council consensus reached.";

        // Extract Recommendations (Parsing the list)
        report.recommendations = [];
        const recSectionIdx = content.search(/(?:3\.|Final Recommendation)/i);
        if (recSectionIdx !== -1) {
            const recText = content.substring(recSectionIdx);
            const lines = recText.split('\n');
            lines.forEach(line => {
                // Matches bullets: - Batch Size: 4  OR * Learning Rate: 5e-5
                const bulbMatch = line.match(/^[\-\*]\s*\*\*?([^\:]+):?\*\*?:?\s*(.*)/);
                if (bulbMatch) {
                    report.recommendations.push({
                        category: bulbMatch[1].trim(),
                        advice: bulbMatch[2].trim()
                    });
                }
            });
        }
    } else {
        // 3. Fallback - API failed or returned null, use intelligent defaults
        report = {
            verdict: "Analysis could not complete fully. Please check your API key or try again.",
            debate_summary: "The analysis pipeline encountered an issue.",
            recommendations: [
                { category: "Retry", advice: "Click 'Analyze Configuration' again to retry the analysis." },
                { category: "API Key", advice: "Ensure your Gemini API key is valid and has quota remaining." },
                { category: "Configuration", advice: "Make sure all required fields are filled in." }
            ],
            open_questions: [
                { topic: "Troubleshooting", question: "Is your API key correctly entered?", why: "Invalid API keys cause analysis failures." }
            ],
            confidence_score: 0
        };
    }

    return (
        <div className="panel reasoning-panel">
            {/* Popups */}
            {showSavePrompt && (
                <div className="save-prompt-overlay">
                    <div className="save-prompt">
                        <h3>Save Configuration?</h3>
                        <div className="save-prompt-actions">
                            <button className="btn btn-primary" onClick={() => { onSaveToHistory(); setShowSavePrompt(false); }}>Save</button>
                            <button className="btn btn-ghost" onClick={onDiscard}>Discard</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header / Tabs */}
            <div className="panel-header with-tabs">
                <div className="panel-tabs">
                    <button
                        className={`tab ${activeTab === 'results' ? 'active' : ''}`}
                        onClick={() => setActiveTab('results')}
                    >
                        Results
                    </button>
                    <button
                        className={`tab ${activeTab === 'compare' ? 'active' : ''}`}
                        onClick={() => setActiveTab('compare')}
                        disabled={comparisonItems.length < 2}
                    >
                        Compare {comparisonItems.length > 0 ? `(${comparisonItems.length})` : ''}
                    </button>
                </div>
            </div>

            <div className="panel-content">
                {/* === TAB 1: RESULTS (Detailed Cards + Synthesis) === */}
                {activeTab === 'results' && (
                    <div className="results-view fade-in">
                        {/* Confidence Meter */}
                        {breakdown?.normalized?.confidence_map && (
                            <div className="confidence-header">
                                <span className="label">Confidence Model:</span>
                                <div className="confidence-pills">
                                    {Object.entries(breakdown.normalized.confidence_map).map(([k, v]) => (
                                        <div key={k} className="pill" title={`${k}: ${Math.round(v * 100)}%`}>
                                            <div className="dot" style={{ background: v > 0.8 ? '#22c55e' : v > 0.5 ? '#f59e0b' : '#ef4444' }}></div>
                                            {k.replace('_', ' ')}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 1. Synthesis Cards (Always Rendered via Parser) */}
                        {/* Verdict Card */}
                        <div className="reasoning-section synthesis-card">
                            <div className="reasoning-header">
                                <span className="reasoning-icon">✓</span>
                                <h3 className="reasoning-title">Final Verdict</h3>
                                <div className="section-actions">
                                    <button className="btn-section-action" onClick={() => onAskAboutSection("Verdict", report.verdict, "explain")}>?</button>
                                </div>
                            </div>
                            <div className="reasoning-content markdown-content">
                                <p className="verdict-text">{report.verdict}</p>
                            </div>
                        </div>

                        {/* Open Questions Card - Shows when AI needs more info */}
                        {report.open_questions && report.open_questions.length > 0 && (
                            <div className="reasoning-section open-questions-card">
                                <div className="reasoning-header">
                                    <span className="reasoning-icon">?</span>
                                    <h3 className="reasoning-title">Questions for You</h3>
                                </div>
                                <div className="reasoning-content">
                                    <p className="questions-intro">To provide better recommendations, I need to know:</p>
                                    <ul className="questions-list">
                                        {report.open_questions.map((q, idx) => (
                                            <li key={idx} className="question-item">
                                                <strong>{q.topic}:</strong> {q.question}
                                                {q.why && <span className="question-why"> — {q.why}</span>}
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="questions-hint">Answer these in the chat panel to refine my analysis.</p>
                                </div>
                            </div>
                        )}

                        {/* Debate Summary - Disabled */}

                        {/* Recommendation Cards (Granular) */}
                        {report.recommendations && report.recommendations.length > 0 ? (
                            report.recommendations.map((rec, idx) => (
                                <div key={idx} className="reasoning-section synthesis-card">
                                    <div className="reasoning-header">
                                        <span className="reasoning-icon">●</span>
                                        <h3 className="reasoning-title">{rec.category || `Recommendation #${idx + 1}`}</h3>
                                        <div className="section-actions">
                                            <button className="btn-section-action" onClick={() => onAskAboutSection(rec.category, rec.advice, "explain")}>?</button>
                                        </div>
                                    </div>
                                    <div className="reasoning-content markdown-content">
                                        <p>{rec.advice || rec}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            // Fallback if parsing failed but it's not structured (rare)
                            !typeof analysis.content === 'object' && (
                                <div className="reasoning-section synthesis-card">
                                    <div className="reasoning-header">
                                        <span className="reasoning-icon">□</span>
                                        <h3 className="reasoning-title">Additional Notes</h3>
                                    </div>
                                    <div className="reasoning-content markdown-content">
                                        <ReactMarkdown>{content}</ReactMarkdown>
                                    </div>
                                </div>
                            )
                        )}

                        {/* 2. Detailed Breakdown Cards */}
                        {hasDetailedBreakdown ? (
                            <>
                                {/* Assumptions Card */}
                                <div className="reasoning-section">
                                    <div className="reasoning-header">
                                        <span className="reasoning-icon">■</span>
                                        <h3 className="reasoning-title">Assumptions & Estimates</h3>
                                        <div className="section-actions">
                                            <button className="btn-section-action" onClick={() => onAskAboutSection("Assumptions & Estimates", `Model VRAM: ~${hardware.memory_analysis?.model_weights_gb || '?'}GB. Strategy: ${dynamics.recommendation || 'Not specified'}. ${breakdown.normalized?.assumptions?.join(', ') || ''}`, "explain")}>?</button>
                                            <button className="btn-section-action" onClick={() => onAskAboutSection("Assumptions", `My analysis made these assumptions - are they correct for my setup?`, "discuss")}>...</button>
                                        </div>
                                    </div>
                                    <div className="reasoning-content">
                                        <ul className="bullet-list">
                                            {hardware.memory_analysis && (
                                                <li>Model VRAM: ~{hardware.memory_analysis.model_weights_gb} GB</li>
                                            )}
                                            {dynamics.recommendation && (
                                                <li>Strategy: {dynamics.recommendation}</li>
                                            )}
                                            {breakdown.normalized?.assumptions && breakdown.normalized.assumptions.map((asm, i) => (
                                                <li key={`asm-${i}`}>{asm}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Memory Usage Card */}
                                <div className="reasoning-section">
                                    <div className="reasoning-header">
                                        <span className="reasoning-icon">▲</span>
                                        <h3 className="reasoning-title">Memory Usage</h3>
                                        <div className="section-actions">
                                            <button className="btn-section-action" onClick={() => onAskAboutSection("Memory Usage", `OOM Risk: ${Math.round((hardware.oom_probability || 0) * 100)}%. Estimated Peak: ${hardware.memory_analysis?.peak_usage_gb || '?'}GB. Model weights: ${hardware.memory_analysis?.model_weights_gb || '?'}GB.`, "explain")}>?</button>
                                        </div>
                                    </div>
                                    <div className="reasoning-content">
                                        {hardware.memory_analysis ? (
                                            <div>
                                                <div className="progress-bar-container">
                                                    <div
                                                        className="progress-bar"
                                                        style={{
                                                            width: `${Math.min((hardware.oom_probability || 0) * 100, 100)}%`,
                                                            backgroundColor: (hardware.oom_probability || 0) > 0.5 ? 'var(--danger)' : 'var(--success)'
                                                        }}
                                                    ></div>
                                                </div>
                                                <p className="small-text">
                                                    Risk Probability: {Math.round((hardware.oom_probability || 0) * 100)}%
                                                    <br />
                                                    Est. Peak: {hardware.memory_analysis.peak_usage_gb || '?'} GB
                                                </p>
                                            </div>
                                        ) : <p>No detailed memory data available.</p>}
                                    </div>
                                </div>

                                {/* Failure Modes Card */}
                                <div className="reasoning-section">
                                    <div className="reasoning-header">
                                        <span className="reasoning-icon">⚠</span>
                                        <h3 className="reasoning-title">Failure Modes</h3>
                                        <div className="section-actions">
                                            <button className="btn-section-action" onClick={() => onAskAboutSection("Failure Modes", `Hardware concerns: ${hardware.potential_issues?.join(', ') || 'None identified'}. Training dynamics risks: ${dynamics.potential_issues?.join(', ') || 'None identified'}.`, "explain")}>?</button>
                                        </div>
                                    </div>
                                    <div className="reasoning-content">
                                        <div className="failure-grid">
                                            {hardware.risk_assessment && (
                                                <div className={`failure-item ${hardware.status === 'success' ? 'safe' : 'warning'}`}>
                                                    <strong>Hardware:</strong> {hardware.risk_assessment.reason || hardware.reasoning}
                                                </div>
                                            )}
                                            {dynamics.reasoning && (
                                                <div className={`failure-item ${dynamics.status === 'success' ? 'safe' : 'warning'}`}>
                                                    <strong>Dynamics:</strong> {dynamics.reasoning}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : null}

                        {/* Discuss Button - Disabled */}
                    </div>
                )}

                {/* === TAB 3: COMPARE === */}
                {activeTab === 'compare' && (
                    <div className="compare-view">
                        {/* Existing Compare Logic */}
                        {comparisonItems.length < 2 ? (
                            <div className="empty-state">
                                <div className="empty-icon small-grey">⇄</div>
                                <h3 className="empty-title">Comparison Awaiting</h3>
                                <p className="empty-description">
                                    Select history items to execute comparative analysis.
                                </p>
                            </div>
                        ) : (
                            <div className="compare-grid">
                                {comparisonItems.map((item, i) => (
                                    <div key={i} className="compare-card">
                                        <h4>#{item.index + 1}</h4>
                                        <pre>{item.config.gpu} + {item.config.modelFamily}</pre>
                                        <div className="verdict-mini">{item.status}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
