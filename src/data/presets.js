// GPU presets with specs for demo scenarios
export const GPU_PRESETS = {
  't4': {
    name: 'NVIDIA T4 (Kaggle/Colab)',
    vram: 16,
    ram: 12,
    computeCapability: '7.5',
    fp16Tflops: 65,
    description: 'Free tier GPU, common for Kaggle competitions'
  },
  'a100_40': {
    name: 'NVIDIA A100 40GB',
    vram: 40,
    ram: 64,
    computeCapability: '8.0',
    fp16Tflops: 312,
    description: 'High-end datacenter GPU'
  },
  'a100_80': {
    name: 'NVIDIA A100 80GB',
    vram: 80,
    ram: 128,
    computeCapability: '8.0',
    fp16Tflops: 312,
    description: 'Top-tier datacenter GPU'
  },
  'v100': {
    name: 'NVIDIA V100 16GB',
    vram: 16,
    ram: 32,
    computeCapability: '7.0',
    fp16Tflops: 125,
    description: 'Previous gen datacenter GPU'
  },
  'rtx3090': {
    name: 'NVIDIA RTX 3090',
    vram: 24,
    ram: 32,
    computeCapability: '8.6',
    fp16Tflops: 71,
    description: 'High-end consumer GPU'
  },
  'rtx4090': {
    name: 'NVIDIA RTX 4090',
    vram: 24,
    ram: 64,
    computeCapability: '8.9',
    fp16Tflops: 165,
    description: 'Top consumer GPU'
  },
  'gtx1080': {
    name: 'NVIDIA GTX 1080',
    vram: 8,
    ram: 16,
    computeCapability: '6.1',
    fp16Tflops: 0.1, // No real FP16 support
    description: 'Older consumer GPU - limited'
  },
  'tpu_v4': {
    name: 'Google TPU v4',
    vram: 32, // HBM per chip
    ram: 128,
    computeCapability: 'TPU',
    fp16Tflops: 275,
    description: 'Cloud TPU - different memory model'
  }
};

// Model presets
export const MODEL_PRESETS = {
  'gpt2': { name: 'GPT-2 (124M)', params: 0.124, family: 'GPT' },
  'gpt2_medium': { name: 'GPT-2 Medium (355M)', params: 0.355, family: 'GPT' },
  'gpt2_large': { name: 'GPT-2 Large (774M)', params: 0.774, family: 'GPT' },
  'gpt2_xl': { name: 'GPT-2 XL (1.5B)', params: 1.5, family: 'GPT' },
  'llama_7b': { name: 'LLaMA 7B', params: 7, family: 'LLaMA' },
  'llama_13b': { name: 'LLaMA 13B', params: 13, family: 'LLaMA' },
  'llama_70b': { name: 'LLaMA 70B', params: 70, family: 'LLaMA' },
  'gemma_2b': { name: 'Gemma 2B', params: 2, family: 'Gemma' },
  'gemma_7b': { name: 'Gemma 7B', params: 7, family: 'Gemma' },
  'qwen_1.8b': { name: 'Qwen 1.8B', params: 1.8, family: 'Qwen' },
  'qwen_7b': { name: 'Qwen 7B', params: 7, family: 'Qwen' },
  'byt5_small': { name: 'ByT5 Small (300M)', params: 0.3, family: 'T5' },
  'byt5_base': { name: 'ByT5 Base (580M)', params: 0.58, family: 'T5' },
  'byt5_large': { name: 'ByT5 Large (1.2B)', params: 1.2, family: 'T5' },
  'custom': { name: 'Custom Model', params: null, family: 'Custom' }
};

// Demo scenarios for the presentation
export const DEMO_SCENARIOS = {
  'oom_crash': {
    name: '🔴 OOM Crash Demo',
    description: 'Intentionally broken config that will predict OOM',
    config: {
      gpu: 't4',
      model: 'llama_7b',
      precision: 'fp32',
      batchSize: 32,
      seqLength: 2048,
      datasetSize: 100000,
      epochs: 3,
      learningRate: 0.0001,
      optimizer: 'adamw'
    }
  },
  'slow_training': {
    name: '🟡 Slow Training Demo',
    description: 'Config that will run but take very long',
    config: {
      gpu: 'gtx1080',
      model: 'gpt2_large',
      precision: 'fp32',
      batchSize: 4,
      seqLength: 1024,
      datasetSize: 1000000,
      epochs: 10,
      learningRate: 0.00005,
      optimizer: 'adamw'
    }
  },
  'good_config': {
    name: '🟢 Balanced Config Demo',
    description: 'Well-tuned configuration',
    config: {
      gpu: 'a100_40',
      model: 'gemma_7b',
      precision: 'fp16',
      batchSize: 8,
      seqLength: 512,
      datasetSize: 50000,
      epochs: 3,
      learningRate: 0.0002,
      optimizer: 'adamw',
      gradAccum: 4
    }
  },
  'kaggle_typical': {
    name: '📊 Typical Kaggle Setup',
    description: 'Common Kaggle competition config',
    config: {
      gpu: 't4',
      model: 'byt5_base',
      precision: 'fp16',
      batchSize: 8,
      seqLength: 256,
      datasetSize: 20000,
      epochs: 5,
      learningRate: 0.0003,
      optimizer: 'adamw'
    }
  }
};

// Canned responses for offline demo mode
export const CANNED_RESPONSES = {
  'oom_crash': {
    stateUnderstanding: `Current configuration: LLaMA 7B model on NVIDIA T4 (16GB VRAM), using FP32 precision with batch size 32 and sequence length 2048.`,
    assumptions: [
      'Model parameters: 7 billion (confirmed)',
      'Activation memory estimated using standard transformer formulas',
      'No gradient checkpointing assumed',
      'AdamW optimizer states require 2x model size'
    ],
    constraints: {
      hard: [
        'VRAM limit: 16GB (T4 GPU)',
        'Model weights alone: ~28GB in FP32'
      ],
      soft: [
        'Training time may exceed 48 hours',
        'Memory bandwidth bottleneck on T4'
      ]
    },
    failureModes: [
      { severity: 'critical', label: 'OOM', message: 'Model weights (28GB) exceed available VRAM (16GB) by 75%', pulse: true },
      { severity: 'critical', label: 'Impossible', message: 'Cannot even load model, let alone train', pulse: true },
      { severity: 'risky', label: 'Precision', message: 'FP32 doubles memory vs FP16 with minimal quality gain' }
    ],
    adjustments: [
      { priority: 1, action: 'Switch to FP16 precision', impact: 'Reduces model size from 28GB to 14GB' },
      { priority: 2, action: 'Reduce batch size to 4', impact: 'Decreases activation memory by 8x' },
      { priority: 3, action: 'Enable gradient checkpointing', impact: 'Trades compute for memory (~30% slower, 60% less memory)' },
      { priority: 4, action: 'Consider smaller model (Gemma 2B)', impact: 'Fits comfortably in T4 VRAM' }
    ],
    counterfactual: `If you switch to FP16: Memory drops from 28GB to 14GB, but still OOM with batch 32. If you also reduce batch to 4 + gradient checkpointing: Should fit in ~12GB, leaving 4GB headroom. Training time increases ~40%.`,
    vramUsage: { used: 28, total: 16, percentage: 175 },
    confidence: 'high',
    verdict: 'CRITICAL: This configuration will crash immediately. Model cannot be loaded.'
  },
  'slow_training': {
    stateUnderstanding: `Current configuration: GPT-2 Large (774M) on GTX 1080 (8GB VRAM), FP32 precision, batch size 4, 1M samples over 10 epochs.`,
    assumptions: [
      'Model parameters: 774 million',
      'GTX 1080 lacks efficient FP16 support',
      'Dataset requires ~10M forward passes',
      'No data parallelism available'
    ],
    constraints: {
      hard: [
        'VRAM limit: 8GB',
        'Limited FP16 acceleration on Pascal architecture'
      ],
      soft: [
        'Training throughput severely limited',
        'Risk of overfitting on 1M samples over 10 epochs'
      ]
    },
    failureModes: [
      { severity: 'safe', label: 'Memory', message: 'Configuration fits in memory (~6GB usage)' },
      { severity: 'risky', label: 'Time', message: 'Estimated training time: 72+ hours', pulse: false },
      { severity: 'risky', label: 'Overfitting', message: '10 epochs on 1M samples may cause memorization' }
    ],
    adjustments: [
      { priority: 1, action: 'Reduce epochs to 3', impact: 'Prevents overfitting, reduces time by 70%' },
      { priority: 2, action: 'Increase batch size to 8', impact: 'Better GPU utilization, ~30% faster' },
      { priority: 3, action: 'Add early stopping', impact: 'Automatic protection against overfitting' }
    ],
    counterfactual: `If you reduce epochs to 3: Training time drops to ~22 hours, lower overfitting risk. If you use a faster GPU (T4): Same config runs 3x faster with FP16 support.`,
    vramUsage: { used: 6, total: 8, percentage: 75 },
    confidence: 'medium',
    verdict: 'WARNING: Configuration will run but has significant time and overfitting risks.'
  },
  'good_config': {
    stateUnderstanding: `Current configuration: Gemma 7B on A100 40GB, FP16 precision, batch size 8 with gradient accumulation 4, 50K samples over 3 epochs.`,
    assumptions: [
      'Model parameters: 7 billion',
      'Effective batch size: 32 (8 × 4 accumulation)',
      'A100 has excellent FP16 throughput',
      'Dataset size appropriate for fine-tuning'
    ],
    constraints: {
      hard: [
        'VRAM limit: 40GB (comfortable headroom)'
      ],
      soft: [
        'Effective batch size of 32 is reasonable',
        'Learning rate 2e-4 is within recommended range'
      ]
    },
    failureModes: [
      { severity: 'safe', label: 'Memory', message: 'Model + activations fit well (~28GB usage)' },
      { severity: 'safe', label: 'Time', message: 'Estimated training time: 4-6 hours' },
      { severity: 'safe', label: 'Convergence', message: 'Hyperparameters within recommended ranges' }
    ],
    adjustments: [
      { priority: 1, action: 'Optional: Increase sequence length to 1024', impact: 'If task benefits from longer context' },
      { priority: 2, action: 'Consider: Add warmup steps', impact: 'Smoother training start' }
    ],
    counterfactual: `If you increase batch size to 16: Memory usage rises to ~35GB (still safe), training ~20% faster. If you switch to FP32: Would OOM - do not do this.`,
    vramUsage: { used: 28, total: 40, percentage: 70 },
    confidence: 'high',
    verdict: 'SAFE: This configuration should train successfully with good performance.'
  }
};

export default {
  GPU_PRESETS,
  MODEL_PRESETS,
  DEMO_SCENARIOS,
  CANNED_RESPONSES
};
