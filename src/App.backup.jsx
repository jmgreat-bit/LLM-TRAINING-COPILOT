import { useState, useCallback, useRef } from 'react';
import ConfigPanel from './components/ConfigPanel';
import ReasoningPanel from './components/ReasoningPanel';
import ChatPanel from './components/ChatPanel';
import { analyzeWithMultiAI, smartChat, demoChatResponse } from './services/gemini';
import { CANNED_RESPONSES } from './data/presets';
import './index.css';

function App() {
  // API Key state
  const [apiKey, setApiKey] = useState('');

  // Configuration state
  const [config, setConfig] = useState({
    gpu: '',
    gpuName: '',
    vram: '',
    ram: '',
    modelPreset: '',
    modelFamily: '',
    modelParams: '',
    precision: 'fp16',
    datasetSize: '',
    seqLength: '',
    language: '',
    batchSize: '',
    gradAccum: 1,
    epochs: '',
    learningRate: '',
    optimizer: 'adamw'
  });

  // Additional notes
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Track if config has been modified since last save
  const [configModified, setConfigModified] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  // Analysis results
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedHistoryIndices, setSelectedHistoryIndices] = useState([]);

  // Chat state
  const [chatMessages, setChatMessages] = useState([]);

  // Loading states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Wrapped setConfig to track modifications
  const handleSetConfig = useCallback((updater) => {
    // If there's an existing analysis and we're modifying, show save prompt
    if (analysis && !configModified) {
      setShowSavePrompt(true);
    }
    setConfigModified(true);
    setConfig(updater);
  }, [analysis, configModified]);

  // Save current state to history
  const saveToHistory = useCallback(() => {
    if (!analysis) return;

    // Determine status from analysis
    let status = 'safe';
    if (analysis.verdict?.includes('CRITICAL') || analysis.verdict?.includes('OOM')) {
      status = 'critical';
    } else if (analysis.verdict?.includes('WARNING') || analysis.verdict?.includes('RISKY')) {
      status = 'risky';
    }

    const historyItem = {
      config: { ...config },
      analysis,
      status,
      timestamp: new Date().toISOString(),
      selected: false
    };
    setHistory(prev => [...prev, historyItem]);
    setConfigModified(false);
  }, [config, analysis]);

  // Analyze configuration
  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true);
    setConfigModified(false);

    try {
      if (apiKey) {
        // Real multi-AI analysis
        const result = await analyzeWithMultiAI(
          { ...config, additionalNotes },
          apiKey,
          history
        );

        if (result.success) {
          setAnalysis({ content: result.content, breakdown: result.breakdown });
        } else {
          throw new Error(result.error);
        }
      } else {
        // Demo mode with canned responses
        await new Promise(resolve => setTimeout(resolve, 1500));

        let responseKey = 'good_config';
        if (config.precision === 'fp32' && config.modelParams >= 7) {
          responseKey = 'oom_crash';
        } else if (config.batchSize >= 32 && config.modelParams >= 7) {
          responseKey = 'oom_crash';
        } else if (config.epochs > 5 || config.datasetSize > 500000) {
          responseKey = 'slow_training';
        }

        setAnalysis(CANNED_RESPONSES[responseKey] || CANNED_RESPONSES['good_config']);
      }
    } catch (error) {
      setAnalysis({
        content: `## ❌ Error\n\n${error.message}\n\nAdd a Gemini API key or try demo mode.`
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [config, additionalNotes, apiKey, history]);

  // Select history item for comparison
  const handleSelectHistory = useCallback((index) => {
    setHistory(prev => prev.map((item, i) => ({
      ...item,
      selected: i === index ? !item.selected : item.selected
    })));

    setSelectedHistoryIndices(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index].slice(-3);
      }
    });
  }, []);

  // Comparison items
  const comparisonItems = selectedHistoryIndices.map(idx => ({
    ...history[idx],
    index: idx
  }));

  // Handle asking about a section (❓ or 💬)
  const handleAskAboutSection = useCallback(async (title, content, type) => {
    // Add user question to chat
    const userQuestion = `About "${title}": Can you explain this further?`;
    setChatMessages(prev => [...prev, { role: 'user', content: userQuestion }]);
    setIsChatLoading(true);

    try {
      if (apiKey) {
        // Use smart chat with full conversation
        const result = await smartChat(
          userQuestion,
          chatMessages,
          config,
          analysis,
          history,
          apiKey
        );
        if (result.success) {
          setChatMessages(prev => [...prev, { role: 'assistant', content: result.content }]);
        } else {
          throw new Error(result.error);
        }
      } else {
        // Demo response
        await new Promise(resolve => setTimeout(resolve, 600));
        const response = demoChatResponse(userQuestion, chatMessages, config, analysis);
        setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
      }
    } catch (error) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I couldn't explain that: ${error.message}`
      }]);
    } finally {
      setIsChatLoading(false);
    }
  }, [config, analysis, history, chatMessages, apiKey]);

  // Send chat message (with full memory)
  const handleSendMessage = useCallback(async (message) => {
    setChatMessages(prev => [...prev, { role: 'user', content: message }]);
    setIsChatLoading(true);

    try {
      if (apiKey) {
        // Smart chat with full conversation history
        const result = await smartChat(
          message,
          chatMessages,
          config,
          analysis,
          history,
          apiKey
        );
        if (result.success) {
          setChatMessages(prev => [...prev, { role: 'assistant', content: result.content }]);
        } else {
          throw new Error(result.error);
        }
      } else {
        // Demo chat with conversation awareness
        await new Promise(resolve => setTimeout(resolve, 600));
        const response = demoChatResponse(message, chatMessages, config, analysis);
        setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
      }
    } catch (error) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error.message}`
      }]);
    } finally {
      setIsChatLoading(false);
    }
  }, [config, analysis, history, chatMessages, apiKey]);

  // Reset
  const handleReset = useCallback(() => {
    if (analysis && configModified) {
      setShowSavePrompt(true);
      return;
    }
    setConfig({
      gpu: '', gpuName: '', vram: '', ram: '',
      modelPreset: '', modelFamily: '', modelParams: '',
      precision: 'fp16', datasetSize: '', seqLength: '',
      language: '', batchSize: '', gradAccum: 1,
      epochs: '', learningRate: '', optimizer: 'adamw'
    });
    setAnalysis(null);
    setChatMessages([]);
    setAdditionalNotes('');
    setSelectedHistoryIndices([]);
    setConfigModified(false);
  }, [analysis, configModified]);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">🧠</span>
            <span>LLM Training Analyzer</span>
          </div>
          <span className="tagline">Multi-AI Pre-flight Checks</span>
        </div>

        <div className="header-controls">
          <div className="api-key-input">
            <label>🔑</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Gemini API Key (optional)"
            />
            {apiKey && <span className="api-status">✓</span>}
          </div>

          <button className="btn btn-ghost" onClick={handleReset}>
            🔄 Reset
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="main-layout">
        <ConfigPanel
          config={config}
          setConfig={handleSetConfig}
          onAnalyze={handleAnalyze}
          isLoading={isAnalyzing}
          history={history}
          onSelectHistory={handleSelectHistory}
          additionalNotes={additionalNotes}
          setAdditionalNotes={setAdditionalNotes}
        />

        <ReasoningPanel
          analysis={analysis}
          comparisonItems={comparisonItems}
          isLoading={isAnalyzing}
          onAskAboutSection={handleAskAboutSection}
          onSaveToHistory={saveToHistory}
          showSavePrompt={showSavePrompt}
          setShowSavePrompt={setShowSavePrompt}
        />

        <ChatPanel
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          isLoading={isChatLoading}
          hasApiKey={!!apiKey}
        />
      </main>
    </div>
  );
}

export default App;
