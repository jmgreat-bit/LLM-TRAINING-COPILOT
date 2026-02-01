// 🛡️ PRE-COMPUTED DEBATE TRACES
// Ensures zero-latency, perfect narrative flow for the Hackathon Demo.
// These match the 'Presets' in the UI.

export const PRECOMPUTED_DEBATES = {
    // Scenario 1: The "Naive Llama-3" Config
    // User tries: Llama-3 8B, Batch 32, FP32 (Obvious OOM on consumer card)
    "llama-3-8b": {
        normalized: {
            explicit: { model: "Llama-3 8B", batch: 32, precision: "fp32" },
            assumptions: ["Single GPU", "AdamW Optimizer (Standard)", "Context 4096"]
        },
        council: {
            hardware: {
                agent: "Pessimist",
                status: "critical",
                memory_usage_gb: 48.5,
                limit_gb: 24,
                reasoning: "Weights(32GB) + Optim(64GB) instantly exceeds 24GB VRAM. Impossible.",
                safe_batch_max: 0
            },
            dynamics: {
                agent: "Optimist",
                status: "warning",
                reasoning: "Batch 32 is great for convergence, but I suspect hardware limits.",
                recommendation: "Use Gradient Accumulation to simulate Batch 32."
            },
            data: {
                agent: "Detective",
                status: "neutral",
                risk: "Low",
                reasoning: "Standard dataset assumptions apply."
            }
        },
        debate: {
            rounds: [
                {
                    speaker: "Referee",
                    text: "CONFLICT: Hardware reports 48GB usage. Dynamics wants Batch 32. This is impossible.",
                    type: "conflict"
                },
                {
                    speaker: "Optimist",
                    text: "I concede. We cannot run natively. Suggesting: FP16 + Gradient Checkpointing.",
                    type: "concession"
                },
                {
                    speaker: "Pessimist",
                    text: "Even with FP16, params=16GB. Batch 32 is still too high. Max safe batch is 4.",
                    type: "rebuttal"
                }
            ]
        },
        synthesis: {
            verdict: "CRITICAL FAILURE (OOM)",
            confidence_score: 95,
            debate_summary: "The Pessimist proved that 48GB VRAM is required, while the Optimist conceded that native Batch 32 is impossible.",
            recommendations: [
                { category: "Precision", advice: "Switch to FP16 immediately (essential)." },
                { category: "Batch Size", advice: "Reduce physical batch size to 4." },
                { category: "Throughput", advice: "Use Gradient Accumulation=8 to match your target." }
            ]
        }
    },

    // Scenario 2: The "Just Barely Fits" Config (High Stakes)
    // User tries: Mistral 7B, Batch 4, FP16
    "mistral-7b": {
        normalized: {
            explicit: { model: "Mistral 7B", batch: 4, precision: "fp16" },
            assumptions: ["Gradient Checkpointing=False", "LoRA=False"]
        },
        council: {
            hardware: {
                agent: "Pessimist",
                status: "warning",
                memory_usage_gb: 22.8,
                limit_gb: 24,
                reasoning: "Very tight. 22.8GB/24GB (95%). Fragmentation risk HIGH.",
                omm_probability: 0.65
            },
            dynamics: {
                agent: "Optimist",
                status: "success",
                reasoning: "Dynamics look solid. Batch 4 is acceptable for fine-tuning.",
                recommendation: "Proceed."
            },
            data: {
                agent: "Detective",
                status: "neutral",
                risk: "Low"
            }
        },
        debate: {
            rounds: [
                {
                    speaker: "Referee",
                    text: "Hardware flags 95% VRAM usage. This is dangerous.",
                    type: "conflict"
                },
                {
                    speaker: "Pessimist",
                    text: "Any background process (browser, display) will kill this run. 65% crash risk.",
                    type: "warning"
                },
                {
                    speaker: "Optimist",
                    text: "Understood. Creating margin. I recommend enabling Gradient Checkpointing.",
                    type: "proposal"
                },
                {
                    speaker: "Hardware",
                    text: "Checkpointing approved. Drops requirement to ~16GB. Safe.",
                    type: "agreement"
                }
            ]
        },
        synthesis: {
            verdict: "RISKY (High Probability of Crash)",
            confidence_score: 85,
            debate_summary: "Hardware analysis indicates 95% usage is too unsafe for production stability.",
            recommendations: [
                { category: "Stability", advice: "Enable Gradient Checkpointing to drop VRAM usage to ~70%." },
                { category: "System", advice: "Close all other applications (high risk of OOM from fragmentation)." }
            ]
        }
    }
};
