import { useState } from 'react';
import { GPU_PRESETS, MODEL_PRESETS } from '../data/presets';

export default function ConfigPanel({
    config,
    setConfig,
    onAnalyze,
    isLoading,
    history,
    onSelectHistory,
    additionalNotes,
    setAdditionalNotes
}) {
    const [expandedSections, setExpandedSections] = useState({
        hardware: true,
        model: true,
        dataset: false,
        training: false
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleChange = (field, value) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleGpuPreset = (presetKey) => {
        const preset = GPU_PRESETS[presetKey];
        if (preset) {
            setConfig(prev => ({
                ...prev,
                gpu: presetKey,
                gpuName: preset.name,
                vram: preset.vram,
                ram: preset.ram
            }));
        }
    };

    const handleModelPreset = (presetKey) => {
        const preset = MODEL_PRESETS[presetKey];
        if (preset) {
            setConfig(prev => ({
                ...prev,
                modelPreset: presetKey,
                modelFamily: preset.family,
                modelParams: preset.params
            }));
        }
    };

    return (
        <div className="panel config-panel">
            <div className="panel-header">
                <h2 className="panel-title">Configuration</h2>
            </div>

            <div className="panel-content">
                {/* Hardware Section */}
                <div className="config-section">
                    <div
                        className="section-header"
                        onClick={() => toggleSection('hardware')}
                    >
                        <h3>Hardware</h3>
                        <span className={`section-toggle ${expandedSections.hardware ? 'open' : ''}`}>▶</span>
                    </div>
                    <div className={`section-content ${!expandedSections.hardware ? 'collapsed' : ''}`}>
                        <div className="form-group">
                            <label>GPU</label>
                            <select
                                value={config.gpu || ''}
                                onChange={(e) => handleGpuPreset(e.target.value)}
                            >
                                <option value="">Select GPU...</option>
                                {Object.entries(GPU_PRESETS).map(([key, gpu]) => (
                                    <option key={key} value={key}>{gpu.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>VRAM (GB)</label>
                                <input
                                    type="number"
                                    value={config.vram || ''}
                                    onChange={(e) => handleChange('vram', parseFloat(e.target.value))}
                                    placeholder="16"
                                />
                            </div>
                            <div className="form-group">
                                <label>RAM (GB)</label>
                                <input
                                    type="number"
                                    value={config.ram || ''}
                                    onChange={(e) => handleChange('ram', parseFloat(e.target.value))}
                                    placeholder="32"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Model Section */}
                <div className="config-section">
                    <div
                        className="section-header"
                        onClick={() => toggleSection('model')}
                    >
                        <h3>Model</h3>
                        <span className={`section-toggle ${expandedSections.model ? 'open' : ''}`}>▶</span>
                    </div>
                    <div className={`section-content ${!expandedSections.model ? 'collapsed' : ''}`}>
                        <div className="form-group">
                            <label>Model</label>
                            <select
                                value={config.modelPreset || ''}
                                onChange={(e) => handleModelPreset(e.target.value)}
                            >
                                <option value="">Select Model...</option>
                                {Object.entries(MODEL_PRESETS).map(([key, model]) => (
                                    <option key={key} value={key}>{model.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Params (B)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={config.modelParams || ''}
                                    onChange={(e) => handleChange('modelParams', parseFloat(e.target.value))}
                                    placeholder="7"
                                />
                            </div>
                            <div className="form-group">
                                <label>Precision</label>
                                <select
                                    value={config.precision || 'fp16'}
                                    onChange={(e) => handleChange('precision', e.target.value)}
                                >
                                    <option value="fp32">FP32</option>
                                    <option value="fp16">FP16</option>
                                    <option value="bf16">BF16</option>
                                    <option value="int8">INT8</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dataset Section */}
                <div className="config-section">
                    <div
                        className="section-header"
                        onClick={() => toggleSection('dataset')}
                    >
                        <h3>Dataset</h3>
                        <span className={`section-toggle ${expandedSections.dataset ? 'open' : ''}`}>▶</span>
                    </div>
                    <div className={`section-content ${!expandedSections.dataset ? 'collapsed' : ''}`}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Samples</label>
                                <input
                                    type="number"
                                    value={config.datasetSize || ''}
                                    onChange={(e) => handleChange('datasetSize', parseInt(e.target.value))}
                                    placeholder="50000"
                                />
                            </div>
                            <div className="form-group">
                                <label>Seq Length</label>
                                <input
                                    type="number"
                                    value={config.seqLength || ''}
                                    onChange={(e) => handleChange('seqLength', parseInt(e.target.value))}
                                    placeholder="512"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Training Section */}
                <div className="config-section">
                    <div
                        className="section-header"
                        onClick={() => toggleSection('training')}
                    >
                        <h3>Training</h3>
                        <span className={`section-toggle ${expandedSections.training ? 'open' : ''}`}>▶</span>
                    </div>
                    <div className={`section-content ${!expandedSections.training ? 'collapsed' : ''}`}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Batch Size</label>
                                <input
                                    type="number"
                                    value={config.batchSize || ''}
                                    onChange={(e) => handleChange('batchSize', parseInt(e.target.value))}
                                    placeholder="8"
                                />
                            </div>
                            <div className="form-group">
                                <label>Epochs</label>
                                <input
                                    type="number"
                                    value={config.epochs || ''}
                                    onChange={(e) => handleChange('epochs', parseInt(e.target.value))}
                                    placeholder="3"
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Learning Rate</label>
                                <input
                                    type="text"
                                    value={config.learningRate || ''}
                                    onChange={(e) => handleChange('learningRate', e.target.value)}
                                    placeholder="0.0002"
                                />
                            </div>
                            <div className="form-group">
                                <label>Optimizer</label>
                                <select
                                    value={config.optimizer || 'adamw'}
                                    onChange={(e) => handleChange('optimizer', e.target.value)}
                                >
                                    <option value="adamw">AdamW</option>
                                    <option value="adam">Adam</option>
                                    <option value="sgd">SGD</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Notes - Above Analyze */}
                <div className="notes-section">
                    <label>Additional Notes <span className="hint">(optional context for AI)</span></label>
                    <textarea
                        className="notes-textarea"
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                        placeholder="Add any extra info: constraints, observations, goals..."
                        rows={3}
                    />
                </div>

                {/* Analyze Button */}
                <div className="analyze-buttons">
                    <button
                        className="btn btn-primary btn-analyze"
                        onClick={onAnalyze}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Analyzing...' : 'Analyze Configuration'}
                    </button>
                </div>

                {/* History Section */}
                {history.length > 0 && (
                    <div className="history-section">
                        <h3 className="history-title">History ({history.length})</h3>
                        <div className="history-list">
                            {history.map((item, index) => (
                                <div
                                    key={index}
                                    className={`history-item ${item.selected ? 'selected' : ''}`}
                                    onClick={() => onSelectHistory(index)}
                                >
                                    <div className="history-item-header">
                                        <span className="history-number">#{index + 1}</span>
                                        <span className={`history-status ${item.status}`}>
                                            {item.status === 'critical' ? '●' : item.status === 'risky' ? '○' : '●'}
                                        </span>
                                    </div>
                                    <div className="history-item-summary">
                                        {item.config.gpuName || item.config.gpu || 'Unknown GPU'} + {item.config.modelFamily || 'Model'}
                                    </div>
                                    <div className="history-item-detail">
                                        Batch {item.config.batchSize || '?'} • {item.config.precision || 'fp16'}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="history-hint">Click to select for comparison • Hold Ctrl to select multiple</p>
                    </div>
                )}
            </div>
        </div>
    );
}
