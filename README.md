# Multi-Model Reasoning App

A lightweight, static web application that enables users to send prompts to multiple reasoning models in parallel and synthesize their responses using a "best" reasoning model. The app supports both browser-local inference (via WebLLM) and remote API-based models (via OpenRouter), making it fully deployable to GitHub Pages with no backend server required.

## Features

**Parallel Model Execution**: Send your prompt to multiple reasoning models simultaneously, with results displayed as they complete. The app handles timeouts and errors gracefully, ensuring one model's failure doesn't block others.

**Dual-Mode Operation**: Choose between browser-only mode (no API keys needed, fully offline) or API mode (access to hundreds of models via OpenRouter). Mix and match models from both sources in a single reasoning flow.

**Intelligent Synthesis**: After collecting responses from all reasoning models, a designated "best" reasoning model synthesizes the outputs into a coherent summary, resolving conflicts and highlighting consensus.

**Privacy-First Design**: Browser-local models run entirely on your device with no data transmission. API keys are stored only in browser localStorage and never sent to external servers (except OpenRouter for API calls).

**Fully Static Deployment**: No backend server, no database, no build pipeline. Deploy directly to GitHub Pages or any static hosting service.

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- A modern browser with WebGPU support (Chrome/Edge 113+, or Firefox with experimental features enabled)
- (Optional) OpenRouter API key for remote model access

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/multi-model-reasoning-app.git
cd multi-model-reasoning-app
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm run dev
```

4. Open your browser to `http://localhost:3000`

## Usage

### Browser-Only Mode (No API Key)

1. The app loads with two small models pre-selected for parallel reasoning (Llama 3.2 1B and Phi 3.5 Mini)
2. Select a larger model as the summarizer (Llama 3.1 8B is recommended)
3. Enter your prompt in the textarea
4. Click "Run All Models"
5. On first run, models will download and cache (30-60 seconds). Subsequent runs are instant
6. View individual model responses and the synthesized summary

### API Mode (With OpenRouter)

1. Get a free OpenRouter API key at https://openrouter.ai/keys
2. Click the Settings icon (⚙️) in the top-right corner
3. Paste your API key and save
4. Select models from the "API (OpenRouter)" section
5. Proceed as above

### Hybrid Mode

Mix browser and API models in the same reasoning flow. For example, run Llama 3.2 1B (browser) and DeepSeek-R1 (API) in parallel, then synthesize with Llama 3.1 8B (browser).

## Architecture

### File Structure

```
client/
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── ModelSelector.tsx       # Multi-select for models
│   │   ├── PromptInput.tsx         # Textarea for prompts
│   │   ├── ModelResponse.tsx       # Display individual outputs
│   │   ├── SummaryPanel.tsx        # Display synthesized summary
│   │   └── SettingsPanel.tsx       # API key management
│   ├── lib/
│   │   ├── modelConfig.ts          # Model definitions
│   │   ├── modelAbstraction.ts     # Unified model interface
│   │   └── reasoningFlow.ts        # Parallel execution logic
│   ├── pages/
│   │   └── Home.tsx                # Main app page
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
└── package.json
```

### Core Components

**modelConfig.ts**: Defines all available models (WebLLM and OpenRouter) with metadata like VRAM requirements, context window, and descriptions. Easy to add new models by editing this file.

**modelAbstraction.ts**: Provides a unified `callModel()` interface that works with both WebLLM and OpenRouter. Handles model loading, API calls, timeouts, and error handling transparently.

**reasoningFlow.ts**: Orchestrates the full reasoning flow—parallel execution of reasoning models, error handling, and synthesis via the summarizer model.

### Model Configuration

To add a new model, edit `client/src/lib/modelConfig.ts`:

```typescript
{
  id: 'my-model',
  name: 'My Model Name',
  provider: 'webllm' | 'openrouter',
  type: 'reasoning' | 'summarizer',
  modelId: 'provider-specific-id',
  vramMb: 3000,  // WebLLM only
  contextWindow: 4096,
  description: 'Brief description',
  enabled: true,
}
```

## Deployment

### GitHub Pages

1. Push your repository to GitHub
2. In repository settings, enable GitHub Pages and select "Deploy from a branch"
3. Set the branch to `main` and folder to `dist`
4. Run `pnpm run build` locally
5. Commit and push the `dist/` folder (or use GitHub Actions)

### Alternative: GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist/public
```

### Other Hosting Services

The app is a static site and works on any host:
- **Netlify**: Connect your GitHub repo, set build command to `pnpm run build`, publish directory to `dist/public`
- **Vercel**: Similar to Netlify, auto-detects build settings
- **Any static host**: Run `pnpm run build` and upload the `dist/public/` folder

## Security & Privacy

**No Backend**: All processing happens in your browser. No data is sent to our servers.

**API Keys**: OpenRouter API keys are stored only in browser localStorage. Never hardcoded in the repository or sent to external servers except OpenRouter.

**Model Weights**: WebLLM model weights are downloaded from Hugging Face CDN and cached in browser storage. No tracking or analytics.

**Prompts**: User prompts are never logged or stored. When using OpenRouter API, prompts are sent to OpenRouter's servers as per their privacy policy.

## Performance Considerations

**First Load**: WebLLM models download on first use (30-60 seconds depending on model size and internet speed). Subsequent loads are instant from browser cache.

**Memory Usage**: Browser models require sufficient VRAM. Check model specs in Settings. Typical requirements:
- Llama 3.2 1B: 879 MB
- Phi 3.5 Mini: 3.6 GB
- Llama 3.1 8B: 5 GB

**Parallelization**: All selected models run concurrently. Total time is roughly the duration of the slowest model, not the sum.

**Streaming**: Model outputs appear in real-time as they're generated. You don't need to wait for all models to complete before seeing results.

## Troubleshooting

**"WebGPU not supported"**: Your browser doesn't support WebGPU. Try Chrome/Edge 113+ or Firefox with experimental features enabled. API mode (OpenRouter) still works.

**Models won't load**: Check browser console for errors. Ensure sufficient VRAM available. Try a smaller model first.

**API key errors**: Verify your OpenRouter API key is correct. Check that your account has credits remaining.

**Slow inference**: This is normal for first load. Subsequent runs are faster. API models are generally faster than browser models.

**Out of memory**: Reduce model size or run fewer models in parallel. Close other browser tabs.

## Available Models

### Browser Models (WebLLM)

**Reasoning Models**:
- Llama 3.2 1B (879 MB) - Fast, lightweight
- Phi 3.5 Mini (3.6 GB) - Good quality
- SmolLM2 360M (376 MB) - Ultra-lightweight
- Qwen 2.5 0.5B (945 MB) - Very small

**Summarizer Models**:
- Llama 3.1 8B (5 GB) - Best reasoning
- Phi 3.5 Mini (3.6 GB) - Good balance

### API Models (OpenRouter)

**Reasoning Models**:
- DeepSeek-R1-Distill-Qwen-7B
- Mistral 7B Instruct
- Qwen 2.5 7B

**Summarizer Models**:
- DeepSeek-R1-Distill-Qwen-14B
- Mistral Large
- And many more available on OpenRouter

## Development

### Build

```bash
pnpm run build
```

Outputs to `dist/` folder (static site ready for deployment).

### Development Server

```bash
pnpm run dev
```

Runs on `http://localhost:3000` with hot module reloading.

### Type Checking

```bash
pnpm run check
```

### Format Code

```bash
pnpm run format
```

## Tech Stack

- **Frontend**: React 19, Tailwind CSS 4, shadcn/ui
- **Browser Models**: WebLLM (WebGPU-accelerated inference)
- **API Integration**: OpenRouter (400+ models)
- **Build Tool**: Vite
- **Deployment**: Static site (GitHub Pages, Netlify, Vercel, etc.)

## Limitations

- WebGPU support required for browser models (modern browsers only)
- Model sizes limited by available VRAM
- Context window limited by model architecture
- No persistent storage of results (refresh clears data)

## Future Enhancements

Potential improvements for future versions:
- Model output caching and history
- Custom model configuration UI
- Streaming output to file
- Advanced prompt templates
- Model comparison tools
- Cost estimation for API calls

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues, questions, or suggestions, please open a GitHub issue or check the troubleshooting section above.

## Acknowledgments

- **WebLLM**: MLC-AI team for browser-based LLM inference
- **OpenRouter**: For providing unified API access to hundreds of models
- **shadcn/ui**: For beautiful, accessible React components
- **Tailwind CSS**: For utility-first styling

---

**Built with ❤️ for AI enthusiasts and developers**
