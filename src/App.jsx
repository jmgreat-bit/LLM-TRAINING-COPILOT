import { useState, useCallback, useRef } from 'react';
import ConfigPanel from './components/ConfigPanel';
import ReasoningPanel from './components/ReasoningPanel';
import ChatPanel from './components/ChatPanel';
import { analyzeWithMultiAI, smartChat, demoChatResponse } from './services/gemini';
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
    setConfigModified(true);
    setConfig(updater);
  }, []);

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

  // Handle Discard (Don't save, just proceed/allow overwrite)
  const handleDiscard = useCallback(() => {
    setShowSavePrompt(false);
    setConfigModified(false); // Mark as "clean" so we don't prompt again
  }, []);

  // Analyze configuration
  const handleAnalyze = useCallback(async () => {
    // Check for unsaved changes before starting NEW analysis
    if (analysis && configModified) {
      setShowSavePrompt(true);
      return;
    }

    setIsAnalyzing(true);
    setConfigModified(false);

    try {
      // API key is required - no demo mode
      if (!apiKey) {
        throw new Error('API key required. Enter your Gemini API key in the header to use the analyzer.');
      }

      // Real multi-AI analysis with Gemini
      const result = await analyzeWithMultiAI(
        { ...config, additionalNotes },
        apiKey,
        history
      );

      if (result.success && result.content && result.content.verdict) {
        // API returned valid data
        setAnalysis({ content: result.content, breakdown: result.breakdown });
      } else if (result.success && result.content) {
        // API returned something but missing verdict - try to use it anyway
        console.warn('Analysis returned but missing verdict:', result);
        setAnalysis({ content: result.content, breakdown: result.breakdown });
      } else {
        // API failed
        console.error('API analysis failed:', result.error || 'Unknown error');
        throw new Error(result.error || 'Analysis returned empty. Please try again.');
      }
    } catch (error) {
      // Return structured error so UI can display it properly
      setAnalysis({
        content: {
          verdict: `Error: ${error.message}`,
          debate_summary: "The analysis pipeline encountered an issue.",
          recommendations: [
            { category: "API Key", advice: "Enter your Gemini API key in the header (top right)." },
            { category: "Retry", advice: "Click 'Analyze Configuration' again to retry." },
            { category: "Check Quota", advice: "Ensure your Gemini API key has available quota." }
          ],
          open_questions: [],
          confidence_score: 0
        },
        breakdown: null
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [config, additionalNotes, apiKey, history, analysis, configModified]);

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
    // Build a question that includes the actual content from the card
    let userQuestion;
    if (content && content !== "See list" && content !== "See chart") {
      // Include the actual content so AI knows what we're asking about
      userQuestion = `About "${title}": "${content.slice(0, 300)}${content.length > 300 ? '...' : ''}"\n\nCan you explain this in more detail?`;
    } else {
      userQuestion = `Explain "${title}" from my analysis results - what does it mean and what should I do about it?`;
    }

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
  const handleSendMessage = useCallback(async (message, image = null) => {
    // Add user message with optional image
    const userMessage = { role: 'user', content: message };
    if (image) {
      userMessage.image = image;
    }
    setChatMessages(prev => [...prev, userMessage]);
    setIsChatLoading(true);

    try {
      if (apiKey) {
        // Smart chat with full conversation history and optional image
        const result = await smartChat(
          message,
          chatMessages,
          config,
          analysis,
          history,
          apiKey,
          image // Pass image to API
        );
        if (result.success) {
          setChatMessages(prev => [...prev, { role: 'assistant', content: result.content }]);
        } else {
          throw new Error(result.error);
        }
      } else {
        // Demo chat with conversation awareness
        await new Promise(resolve => setTimeout(resolve, 600));
        const response = image
          ? "🖼️ I see you've uploaded an image! In demo mode, I can't analyze images. Add your Gemini API key for full vision capabilities."
          : demoChatResponse(message, chatMessages, config, analysis);
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

  // --- RESIZABLE LAYOUT LOGIC ---
  const [leftWidth, setLeftWidth] = useState(25); // %
  const [rightWidth, setRightWidth] = useState(30); // %
  const containerRef = useRef(null);
  const isDraggingLeft = useRef(false);
  const isDraggingRight = useRef(false);

  // Mouse move handler for resizing
  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;

    // Calculate percentage based on container width
    const containerRect = containerRef.current.getBoundingClientRect();
    const relativeX = e.clientX - containerRect.left;
    const percentage = (relativeX / containerRect.width) * 100;

    if (isDraggingLeft.current) {
      // Left resize: Limit between 15% and 40%
      const newWidth = Math.min(Math.max(percentage, 15), 40);
      setLeftWidth(newWidth);
    }
    else if (isDraggingRight.current) {
      // Right resize: Calculate from right edge
      // percentage is position of split. Right width = 100 - percentage
      const newRightWidth = 100 - percentage;
      // Limit between 20% and 50%
      const clampedRight = Math.min(Math.max(newRightWidth, 20), 50);
      setRightWidth(clampedRight);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingLeft.current = false;
    isDraggingRight.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'default';
  }, [handleMouseMove]);

  const startResizeLeft = useCallback(() => {
    isDraggingLeft.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
  }, [handleMouseMove, handleMouseUp]);

  const startResizeRight = useCallback(() => {
    isDraggingRight.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <img src="/logo.png" alt="LLM Copilot" className="logo-icon" />
            <span>LLM Training Copilot</span>
          </div>
          <span className="tagline">Powered by Gemini 3 Multi-AI Reasoning</span>
        </div>

        <div className="header-controls">
          <div className="api-key-input">
            <label>🔑</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Gemini 3 API Key (optional)"
            />
            {apiKey && <span className="api-status">✓</span>}
          </div>

          <button className="btn btn-ghost" onClick={handleReset}>
            🔄 Reset
          </button>
        </div>
      </header>

      {/* Main Layout - CUSTOM RESIZABLE */}
      <main
        className="main-layout-custom"
        ref={containerRef}
      >
        {/* LEFT: Config Panel */}
        <div
          className="panel-wrapper"
          style={{ width: `${leftWidth}%` }}
        >
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
        </div>

        {/* DRAG HANDLE 1 */}
        <div
          className="drag-handle"
          onMouseDown={startResizeLeft}
          title="Drag to resize Config"
        />

        {/* MIDDLE: Reasoning Panel (Fills remaining space) */}
        <div
          className="panel-wrapper"
          style={{
            width: `${100 - leftWidth - rightWidth}%`,
            flex: 1
          }}
        >
          <ReasoningPanel
            analysis={analysis}
            comparisonItems={comparisonItems}
            isLoading={isAnalyzing}
            onAskAboutSection={handleAskAboutSection}
            onSaveToHistory={saveToHistory}
            showSavePrompt={showSavePrompt}
            setShowSavePrompt={setShowSavePrompt}
            onDiscard={handleDiscard}
          />
        </div>

        {/* DRAG HANDLE 2 */}
        <div
          className="drag-handle"
          onMouseDown={startResizeRight}
          title="Drag to resize Chat"
        />

        {/* RIGHT: Chat Panel */}
        <div
          className="panel-wrapper"
          style={{ width: `${rightWidth}%` }}
        >
          <ChatPanel
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            onClearChat={() => setChatMessages([])}
            isLoading={isChatLoading}
            hasApiKey={!!apiKey}
          />
        </div>

      </main>
    </div>
  );
}

export default App;
