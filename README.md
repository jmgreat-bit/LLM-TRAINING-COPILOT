# LLM Training Copilot

> **A pre-flight check tool that predicts if your ML training will succeed BEFORE you waste hours on a failed run.**

Built with **Gemini 3** for the Google AI Hackathon.

---

## The Problem

Training LLMs often fails due to:
- **OOM crashes** — Out of memory errors 2 hours into training
- **Overfitting** — Model memorizes instead of learning
- **Wrong hyperparameters** — Training never converges
- **Time miscalculations** — "Quick run" takes 3 days

You only discover these **after** training starts. This tool tells you **before**.

---

## Features

| Feature | Description |
|---------|-------------|
| **Multi-AI Analysis** | 3 specialist Gemini 3 agents: Hardware Analyst, Training Analyst, Chief Analyst |
| **Pre-flight Predictions** | Memory usage, failure modes, training time, overfitting risk |
| **Explain Buttons** | Click Help on any section for detailed explanation |
| **Smart Chat** | Ask configuration questions — AI answers with calculations |
| **History & Compare** | Save configs, compare side-by-side |
| **Demo Mode** | Works with specific presets (e.g. Llama-3 8B) without API key |

---

## How Multi-AI Reasoning Works

```
User Config → [Hardware Analyst] → Memory calculations
           → [Training Analyst] → Hyperparameter analysis
                     ↓
              [Chief Analyst] → Synthesized verdict
                     ↓
           Safe / Risky / Will Fail
```

Each specialist focuses on its domain. The Chief Analyst combines their reasoning into actionable advice.

---

## Screenshots

*[Add screenshots here]*

---

## Quick Start

```bash
# Clone the repo
git clone <repo-url>
cd llm-training-analyzer

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:5173`

### Using the API

1. Get a Gemini API key from [AI Studio](https://aistudio.google.com/apikey)
2. Enter it in the header input
3. Run analysis with real Gemini 3 reasoning

---

## Tech Stack

- **Frontend**: React + Vite
- **AI**: Gemini 3 API (Pro for Reasoning Council, Flash for Chat)
- **Styling**: Custom CSS, dark theme

---

## Usage

1. **Configure** — Fill in GPU, model, training parameters
2. **Analyze** — Click "Analyze Configuration"
3. **Review** — Check predictions across all sections
4. **Ask** — Click help icons for explanations or chat for follow-ups
5. **Iterate** — Adjust config, analyze again, compare results

---

## Target Users

- Engineers configuring LLM fine-tuning
- Researchers working with limited GPU resources
- Students experimenting with low-resource language models

---

## Project Structure

```
src/
├── App.jsx              # Main app with state management
├── components/
│   ├── ConfigPanel.jsx  # Left panel - configuration inputs
│   ├── ReasoningPanel.jsx # Center panel - analysis results
│   └── ChatPanel.jsx    # Right panel - AI chat
├── services/
│   └── gemini.js        # Gemini 3 API integration
├── data/
│   └── presets.js       # GPU/Model presets, demo responses
└── index.css            # Styling
```

---

## Built For

**Google Gemini 3 API Developer Competition**

This project demonstrates Gemini 3's capability for:
- Structured reasoning across multiple domains
- Technical analysis with calculations
- Conversational follow-up with context retention

---

## License

MIT
