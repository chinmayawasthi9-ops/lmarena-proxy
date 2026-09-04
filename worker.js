/**
 * LMArena Cloudflare Worker Gateway
 * Acts as a serverless coordinator bridging OpenAI API requests and the LMArena browser injector.
 */

const FALLBACK_MODELS = {
  // --- User Requested Models ---
  "claude-fable-5.1-high": { id: "claude-fable-5.1-high", type: "chat" },
  "grok-4.6-high": { id: "grok-4.6-high-public", type: "chat" },
  "gemini-3.8-flash-high": { id: "gemini-3.8-flash-high", type: "chat" },

  // --- Complete Active LMArena Registry ---
  "gemini-3-flash": { id: "gemini-3-flash", type: "chat" },
  "glm-5.1": { id: "glm-5.1", type: "chat" },
  "qwen3.5-397b-a17b": { id: "qwen3.5-397b-a17b", type: "chat" },
  "claude-sonnet-4-5-20250929": { id: "claude-sonnet-4-5-20250929", type: "chat" },
  "gemini-3.1-pro-preview": { id: "gemini-3.1-pro-preview", type: "chat" },
  "qwen3.7-plus": { id: "qwen3.7-plus", type: "chat" },
  "minimax-m3": { id: "minimax-m3", type: "chat" },
  "claude-haiku-4-5-20251001": { id: "claude-haiku-4-5-20251001", type: "chat" },
  "gemini-2.5-pro": { id: "e2d9d353-6dbe-4414-bf87-bd289d523726", type: "chat" },
  "glm-5v-turbo": { id: "glm-5v-turbo", type: "chat" },
  "grok-4.20-beta-0309-reasoning": { id: "grok-4.20-beta-0309-reasoning", type: "chat" },
  "gpt-5.2-high": { id: "gpt-5.2-high-no-system-prompt-text", type: "chat" },
  "gpt-5.5-instant": { id: "gpt-5.5-instant-2026-05-28", type: "chat" },
  "gpt-5.1": { id: "gpt-5.1", type: "chat" },
  "gpt-5.2": { id: "gpt-5.2-no-system-prompt-text", type: "chat" },
  "gemini-3.6-flash": { id: "gemini-3.6-flash", type: "chat" },
  "claude-sonnet-4-6": { id: "claude-sonnet-4-6-vertex", type: "chat" },
  "grok-4.20-multi-agent-beta-0309": { id: "grok-4.20-multi-agent-beta-0309", type: "chat" },
  "qwen3.5-max-preview": { id: "kiteki", type: "chat" },
  "glm-5": { id: "glm-5", type: "chat" },
  "gemini-3.5-flash-lite": { id: "gemini-3.5-flash-lite", type: "chat" },
  "claude-sonnet-4-5-20250929-thinking-32k": { id: "claude-sonnet-4-5-20250929-thinking-32k", type: "chat" },
  "gpt-5.1-high": { id: "gpt-5.1-high", type: "chat" },
  "gpt-5.4-mini-high": { id: "gpt-5.4-mini-high", type: "chat" },
  "glm-4.7": { id: "glm-4.7-text-fireworks", type: "chat" },
  "qwen3-max-preview": { id: "qwen3-max-preview-v2", type: "chat" },
  "gpt-5-high": { id: "gpt-5-high", type: "chat" },
  "o3-2025-04-16": { id: "o3-2025-04-16", type: "chat" },
  "kimi-k2.5-instant": { id: "kimi-k2.5-instant-20260302", type: "chat" },
  "kimi-k2-thinking-turbo": { id: "kimi-k2-thinking-turbo", type: "chat" },
  "gpt-5-chat": { id: "gpt-5-chat", type: "chat" },
  "qwen3-max-2025-09-23": { id: "qwen3-max-2025-09-23", type: "chat" },
  "qwen3-235b-a22b-instruct-2507": { id: "qwen3-235b-a22b-instruct-2507", type: "chat" },
  "kimi-k2-0905-preview": { id: "kimi-k2-0905-preview", type: "chat" },
  "kimi-k2-0711-preview": { id: "kimi-k2-0711-preview", type: "chat" },
  "qwen3.5-122b-a10b": { id: "qwen3.5-122b-a10b", type: "chat" },
  "minimax-m2.7": { id: "deep-octo", type: "chat" },
  "gpt-4.1-2025-04-14": { id: "gpt-4.1-2025-04-14", type: "chat" },
  "qwen3-vl-235b-a22b-instruct": { id: "qwen3-vl-235b-a22b-instruct", type: "chat" },
  "mistral-large-3": { id: "jaguar", type: "chat" },
  "gemini-2.5-flash": { id: "ce2092c1-28d4-4d42-a1e0-6b061dfe0b20", type: "chat" },
  "mistral-medium-2508": { id: "mistral-medium-2508", type: "chat" },
  "qwen3.5-27b": { id: "qwen3.5-27b", type: "chat" },
  "inkling-small": { id: "inkling-small", type: "chat" },
  "qwen3-235b-a22b-no-thinking": { id: "qwen3-235b-a22b-no-thinking", type: "chat" },
  "gpt-5.4-nano-high": { id: "gpt-5.4-nano-high", type: "chat" },
  "longcat-flash-chat": { id: "longcat-flash-chat", type: "chat" },
  "claude-sonnet-4-20250514-thinking-32k": { id: "claude-sonnet-4-20250514-thinking-32k", type: "chat" },
  "qwen3-235b-a22b-thinking-2507": { id: "qwen3-235b-a22b-thinking-2507", type: "chat" },
  "qwen3-next-80b-a3b-instruct": { id: "qwen3-next-80b-a3b-instruct", type: "chat" },
  "qwen3.5-flash": { id: "qwen3.5-flash", type: "chat" },
  "hunyuan-vision-1.5-thinking": { id: "hunyuan-vision-1.5-thinking", type: "chat" },
  "qwen3.5-35b-a3b": { id: "qwen3.5-35b-a3b", type: "chat" },
  "qwen3-vl-235b-a22b-thinking": { id: "qwen3-vl-235b-a22b-thinking", type: "chat" },
  "step-3.5-flash": { id: "step-3.5-flash-openrouter", type: "chat" },
  "o4-mini-2025-04-16": { id: "o4-mini-2025-04-16", type: "chat" },
  "minimax-m2.5": { id: "minimax-m2.5", type: "chat" },
  "claude-sonnet-4-20250514": { id: "claude-sonnet-4-20250514", type: "chat" },
  "gpt-5-mini-high": { id: "gpt-5-mini-high", type: "chat" },
  "qwen3-coder-480b-a35b-instruct": { id: "qwen3-coder-480b-a35b-instruct", type: "chat" },
  "minimax-m2.1-preview": { id: "minimax-m2.1-preview", type: "chat" },
  "gpt-4.1-mini-2025-04-14": { id: "gpt-4.1-mini-2025-04-14", type: "chat" },
  "qwen3-30b-a3b-instruct-2507": { id: "qwen3-30b-a3b-instruct-2507", type: "chat" },
  "trinity-large-preview": { id: "trinity-large", type: "chat" },
  "qwen3-235b-a22b": { id: "qwen3-235b-a22b", type: "chat" },
  "trinity-large-thinking": { id: "trinity-large-thinking", type: "chat" },
  "qwen3-next-80b-a3b-thinking": { id: "qwen3-next-80b-a3b-thinking", type: "chat" },
  "gemma-3-27b-it": { id: "gemma-3-27b-it", type: "chat" },
  "minimax-m1": { id: "minimax-m1", type: "chat" },
  "gemini-2.0-flash-001": { id: "gemini-2.0-flash-001", type: "chat" },
  "intellect-3": { id: "intellect-3", type: "chat" },
  "gpt-oss-120b": { id: "gpt-oss-120b", type: "chat" },
  "o3-mini": { id: "o3-mini", type: "chat" },
  "mercury-2": { id: "mercury-2", type: "chat" },
  "minimax-m2": { id: "minimax-m2", type: "chat" },
  "ling-flash-2.0": { id: "ling-flash-2.0", type: "chat" },
  "gpt-5-nano-high": { id: "gpt-5-nano-high", type: "chat" },
  "nova-2-lite": { id: "global.amazon.nova-2-lite-v1:0", type: "chat" },
  "qwq-32b": { id: "qwq-32b", type: "chat" },
  "qwen3-30b-a3b": { id: "qwen3-30b-a3b", type: "chat" },
  "ring-flash-2.0": { id: "ring-flash-2.0", type: "chat" },
  "gemma-3n-e4b-it": { id: "gemma-3n-e4b-it", type: "chat" },
  "gpt-oss-20b": { id: "gpt-oss-20b", type: "chat" },
  "nvidia-nemotron-3-nano-30b-a3b-bf16": { id: "december-chatbot", type: "chat" },
  "mercury": { id: "mercury", type: "chat" },
  "granite-4.1-8b": { id: "granite-4.1-8b", type: "chat" },
  "ibm-granite-h-small": { id: "ibm-granite-h-small", type: "chat" },
  "nvidia-nemotron-3-super-120b-a12b": { id: "march26-chatbot1-public", type: "chat" },
  "ring-2.5-1t": { id: "ring-2.5-1t-20260217", type: "chat" },
  "muse-glimmer": { id: "onyx-v1-4-33s7", type: "chat" },
  "ling-2.5-1t": { id: "ling-2.5-1t", type: "chat" },
  "gemini-3.1-flash-lite": { id: "gemini-3.1-flash-lite", type: "chat" },
  "solar-pro4": { id: "solar-pro4-openrouter", type: "chat" },
  "deepseek-v4-flash-vision-exp-max": { id: "deepseek-v4-flash-vision-exp-max", type: "chat" },
  "deepseek-v4-flash-vision-exp-low": { id: "deepseek-v4-flash-vision-exp-low", type: "chat" },
  "nvidia-nemotron-3-ultra-550b-a55b-nvfp4": { id: "may26-chatbot4-public", type: "chat" },
  "qwen3-vl-8b-thinking": { id: "qwen3-vl-8b-thinking", type: "chat" },
  "gpt-5-high-new-system-prompt": { id: "gpt-5-high-new-system-prompt", type: "chat" },
  "mimo-v2.5-pro": { id: "mimo-v2.5-pro", type: "chat" },
  "longcat-2.0": { id: "longcat-2.0-siliconflow", type: "chat" },
  "qwen-vl-max-2025-08-13": { id: "qwen-vl-max-2025-08-13", type: "chat" },
  "qwen3-omni-flash": { id: "qwen3-omni-flash", type: "chat" },
  "kimi-k2.5-thinking": { id: "kimi-k2.5-20260327", type: "chat" },
  "deepseek-v4-pro-max": { id: "deepseek-v4-pro-max-20260813", type: "chat" },
  "qwen3.7-max": { id: "mizar-v2-85jb", type: "chat" },
  "inkling-small-low": { id: "inkling-small-low", type: "chat" },
  "mimo-v2.5": { id: "mimo-v2.5", type: "chat" },
  "gemini-3.5-flash": { id: "gemini-3.5-flash", type: "chat" },
  "gemini-3.7-flash": { id: "gemini-3.7-flash", type: "chat" },
  "deepseek-v4-flash-max-20260731": { id: "deepseek-v4-flash-max-20260731", type: "chat" },
  "mistral-medium-3.5": { id: "mistral-medium-3.5-v2", type: "chat" },
  "inkling-low": { id: "inkling-low", type: "chat" },
  "deepseek-v4-pro": { id: "deepseek-v4-pro-20260813", type: "chat" },
  "deepseek-v4-flash-low-20260731": { id: "deepseek-v4-flash-low", type: "chat" },
  "glm-5.2 (max)": { id: "glm-5.2", type: "chat" },
  "glm-5.2": { id: "glm-5.2", type: "chat" },
  "deepseek-v4-flash-20260731": { id: "deepseek-v4-flash-20260730", type: "chat" },
  "gemini-3.5-flash-high": { id: "gemini-3.5-flash-high", type: "chat" },
  "qwen3-vl-8b-instruct": { id: "qwen3-vl-8b-instruct", type: "chat" },
  "gemini-3-flash (thinking-minimal)": { id: "gemini-3-flash-thinking-minimal-fixed-20251224", type: "chat" },
  "grok-4.3": { id: "grok-4.3", type: "chat" },
  "gemma-4-26b-a4b": { id: "significant-otter", type: "chat" },
  "qwen3-max-thinking": { id: "qwen3-max-thinking", type: "chat" },
  "qwen3-max-2025-09-26": { id: "qwen3-max-2025-09-26", type: "chat" },
  "grok-4.6-low": { id: "grok-4.6-low-public", type: "chat" },
  "minimax-m2-preview": { id: "minimax-m2-preview", type: "chat" },
  "deepseek-v4-pro-high": { id: "deepseek-v4-pro-high-20260813", type: "chat" },
  "nvidia-nemotron-3.5-lightning-30b-a3b-nvfp4": { id: "august26-chatbot1-fmme", type: "chat" },
  "grok-4.6-medium": { id: "grok-4.6-medium-public", type: "chat" },
  "claude-sonnet-5-high": { id: "claude-sonnet-5-vertex", type: "chat" },
  "qwen3.6-plus": { id: "qwen3.6-plus-text", type: "chat" },
  "grok-4.5": { id: "grok-4.5", type: "chat" },
  "deepseek-v4-flash-high-20260731": { id: "deepseek-v4-flash-thinking-20260730", type: "chat" },
  "deepseek-v4-pro-low": { id: "deepseek-v4-pro-low-20260813", type: "chat" },
  "inkling-medium": { id: "inkling-medium", type: "chat" },
  "qwen3.6-27b": { id: "qwen3.6-27b", type: "chat" },
  "gemma-4-31b": { id: "pteronura", type: "chat" },
  "qwen3.7-max-preview": { id: "melyora-9qr6", type: "chat" },
  "deepseek-v4-flash-vision-exp-high": { id: "deepseek-v4-flash-vision-exp-high", type: "chat" },
  "inkling-small-medium": { id: "inkling-small-medium", type: "chat" },
  "amazon.nova-pro-v1:0": { id: "amazon.nova-pro-v1:0", type: "chat" },
  "qwen3.6-max-preview": { id: "kizen-alpha", type: "chat" },
  "qwen3.7-plus-preview": { id: "may-alpha-0k1k", type: "chat" }
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/test") {
      return new Response("TEST OK");
    }
    if (!env.PROXY_HUB) {
      return new Response("Missing Durable Object PROXY_HUB binding in wrangler.toml", { status: 500 });
    }
    const id = env.PROXY_HUB.idFromName("global");
    const stub = env.PROXY_HUB.get(id);

    if (url.pathname === "/debug") {
      try {
        const info = await stub.getDebugInfo();
        return Response.json(info, { headers: { "Access-Control-Allow-Origin": "*" } });
      } catch (e) {
        return Response.json({ error: e.message }, { headers: { "Access-Control-Allow-Origin": "*" } });
      }
    }

    return stub.fetch(request);
  }
};

export class LMArenaProxyHub {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.browserWs = null;
    this.models = { ...FALLBACK_MODELS };
    this.pendingStreams = new Map(); // requestId -> streamInfo
    this.recentLogs = [];
  }

  async getDebugInfo() {
    return {
      browserConnected: this.browserWs !== null,
      modelCount: Object.keys(this.models).length,
      logs: this.recentLogs
    };
  }

  log(msg) {
    const entry = `[${new Date().toISOString()}] ${msg}`;
    console.log(entry);
    this.recentLogs.push(entry);
    if (this.recentLogs.length > 100) this.recentLogs.shift();
  }

  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "*"
        }
      });
    }

    // 1. WebSocket endpoint for the browser userscript
    if (path === "/ws") {
      const upgradeHeader = request.headers.get("Upgrade");
      if (!upgradeHeader || upgradeHeader.toLowerCase() !== "websocket") {
        return new Response("Expected WebSocket Upgrade", { status: 426 });
      }

      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      server.accept();
      this.browserWs = server;
      this.log("Browser WebSocket connected");

      server.addEventListener("message", (event) => {
        try {
          const msg = JSON.parse(event.data);

          // Handle model registry from browser
          if (msg.type === "model_registry" && msg.models) {
            this.models = { ...FALLBACK_MODELS, ...msg.models };
            this.log(`Model registry updated: ${Object.keys(this.models).length} models`);
            server.send(JSON.stringify({ type: "model_registry_ack", count: Object.keys(this.models).length }));
            return;
          }

          // Handle pong
          if (msg.type === "pong") return;

          // Log and handle streaming chunks
          if (msg.request_id && msg.data !== undefined) {
            const preview = typeof msg.data === "string" ? msg.data.slice(0, 80) : JSON.stringify(msg.data);
            this.log(`Chunk for ${msg.request_id}: ${preview}`);

            const streamInfo = this.pendingStreams.get(msg.request_id);
            if (streamInfo) {
              const { controller, isStreaming, model } = streamInfo;

              if (msg.data === "[DONE]") {
                if (isStreaming) {
                  controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
                  controller.close();
                } else {
                  const responseJson = {
                    id: `chatcmpl-${crypto.randomUUID()}`,
                    object: "chat.completion",
                    created: Math.floor(Date.now() / 1000),
                    model: model,
                    choices: [{
                      index: 0,
                      message: { role: "assistant", content: streamInfo.accumulatedContent },
                      finish_reason: "stop"
                    }]
                  };
                  controller.enqueue(new TextEncoder().encode(JSON.stringify(responseJson)));
                  controller.close();
                }
                this.pendingStreams.delete(msg.request_id);
              } else if (typeof msg.data === "string" && (msg.data.startsWith("a0:") || msg.data.startsWith("0:"))) {
                try {
                  const prefixLen = msg.data.startsWith("a0:") ? 3 : 2;
                  const text = JSON.parse(msg.data.slice(prefixLen));
                  streamInfo.accumulatedContent += text;
                  if (isStreaming) {
                    const chunk = {
                      id: `chatcmpl-${crypto.randomUUID()}`,
                      object: "chat.completion.chunk",
                      created: Math.floor(Date.now() / 1000),
                      model: model,
                      choices: [{
                        index: 0,
                        delta: { role: "assistant", content: text },
                        finish_reason: null
                      }]
                    };
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(chunk)}\n\n`));
                  }
                } catch (_) {}
              } else {
                // Check if message is error JSON
                try {
                  const parsed = typeof msg.data === "string" ? JSON.parse(msg.data) : msg.data;
                  if (parsed && parsed.error) {
                    this.log(`Error from browser for ${msg.request_id}: ${JSON.stringify(parsed.error)}`);
                    const errChunk = `data: ${JSON.stringify({ error: parsed.error })}\n\n`;
                    controller.enqueue(new TextEncoder().encode(errChunk));
                  }
                } catch (_) {}
              }
            }
          }
        } catch (e) {
          this.log(`WS error parsing message: ${e.message}`);
        }
      });

      server.addEventListener("close", () => {
        if (this.browserWs === server) {
          this.browserWs = null;
          this.log("Browser WebSocket disconnected");
        }
      });

      return new Response(null, { status: 101, webSocket: client });
    }

    // Debug logs endpoint
    if (path === "/debug") {
      return Response.json({
        browserConnected: this.browserWs !== null,
        modelCount: Object.keys(this.models).length,
        logs: this.recentLogs
      }, { headers: { "Access-Control-Allow-Origin": "*" } });
    }

    // 2. OpenAI /v1/models
    if (path === "/v1/models") {
      const data = Object.keys(this.models).map((name) => ({
        id: name,
        object: "model",
        created: Math.floor(Date.now() / 1000),
        owned_by: "lmarena"
      }));
      return Response.json({ object: "list", data }, { headers: { "Access-Control-Allow-Origin": "*" } });
    }

    // 3. OpenAI /v1/chat/completions
    if (path === "/v1/chat/completions" && request.method === "POST") {
      if (!this.browserWs) {
        return Response.json(
          { error: { message: "Browser client not connected. Please open lmarena.ai with injector script enabled.", type: "service_unavailable" } },
          { status: 503, headers: { "Access-Control-Allow-Origin": "*" } }
        );
      }

      const body = await request.json();
      const modelName = body.model || "gemini-2.5-flash";
      const modelInfo = this.models[modelName] || { id: modelName, type: "chat" };
      const requestId = crypto.randomUUID();
      const isStreaming = body.stream !== false;

      // Transform OpenAI messages into exact LMArena payload
      const evaluationId = crypto.randomUUID();
      const messages = body.messages || [];
      const processedMessages = [];

      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        processedMessages.push({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content)
        });
      }

      // Find the last user message index
      let lastUserIdx = -1;
      for (let i = processedMessages.length - 1; i >= 0; i--) {
        if (processedMessages[i].role === "user") {
          lastUserIdx = i;
          break;
        }
      }

      // In direct chat mode, Arena expects an empty user message after the last user message
      if (lastUserIdx !== -1) {
        processedMessages.splice(lastUserIdx + 1, 0, { role: "user", content: " " });
      }

      // Build Arena messages with parentMessageIds chain
      const arenaMessages = [];
      const messageIds = processedMessages.map(() => crypto.randomUUID());

      for (let i = 0; i < processedMessages.length; i++) {
        const pmsg = processedMessages[i];
        const parentIds = i > 0 ? [messageIds[i - 1]] : [];
        arenaMessages.push({
          id: messageIds[i],
          role: pmsg.role,
          content: pmsg.content,
          experimental_attachments: [],
          parentMessageIds: parentIds,
          participantPosition: "a",
          modelId: pmsg.role === "assistant" ? modelInfo.id : null,
          evaluationSessionId: evaluationId,
          status: "pending",
          failureReason: null
        });
      }

      const userMessageId = messageIds[messageIds.length - 1] || crypto.randomUUID();
      const modelAMessageId = crypto.randomUUID();
      arenaMessages.push({
        id: modelAMessageId,
        role: "assistant",
        content: "",
        experimental_attachments: [],
        parentMessageIds: [userMessageId],
        participantPosition: "a",
        modelId: modelInfo.id,
        evaluationSessionId: evaluationId,
        status: "pending",
        failureReason: null
      });

      const lmarenaPayload = {
        id: evaluationId,
        mode: "direct",
        modelAId: modelInfo.id,
        userMessageId: userMessageId,
        modelAMessageId: modelAMessageId,
        messages: arenaMessages,
        modality: "chat"
      };

      // Set up stream / response
      const stream = new ReadableStream({
        start: (controller) => {
          this.pendingStreams.set(requestId, {
            controller,
            isStreaming,
            model: modelName,
            accumulatedContent: ""
          });
        },
        cancel: () => {
          this.pendingStreams.delete(requestId);
          if (this.browserWs) {
            this.browserWs.send(JSON.stringify({ type: "abort_request", request_id: requestId }));
          }
        }
      });

      this.log(`Dispatching request ${requestId} for model ${modelName} (${modelInfo.id})`);

      // Send task to browser
      this.browserWs.send(JSON.stringify({
        request_id: requestId,
        payload: lmarenaPayload,
        files_to_upload: []
      }));

      const contentType = isStreaming ? "text/event-stream" : "application/json";
      return new Response(stream, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // 4. Simple Monitor Dashboard
    if (path === "/monitor" || path === "/") {
      const isConnected = this.browserWs !== null;
      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>LMArena Cloudflare Worker</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; max-width: 800px; margin: auto; }
    .card { background: #1e293b; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; border: 1px solid #334155; }
    .badge { display: inline-block; padding: 0.35rem 0.75rem; border-radius: 9999px; font-weight: 600; font-size: 0.875rem; }
    .connected { background: #166534; color: #4ade80; }
    .disconnected { background: #991b1b; color: #f87171; }
    code { background: #0f172a; padding: 0.2rem 0.4rem; border-radius: 4px; font-family: monospace; color: #38bdf8; }
    pre { background: #0f172a; padding: 1rem; border-radius: 8px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>☁️ LMArena Cloudflare Worker</h1>
  <div class="card">
    <h3>Browser Connection Status</h3>
    <p>Status: <span class="badge ${isConnected ? 'connected' : 'disconnected'}">${isConnected ? '🟢 Browser Connected' : '🔴 Disconnected'}</span></p>
    <p>Available Models: <code>${Object.keys(this.models).length}</code></p>
  </div>
  <div class="card">
    <h3>OpenAI API Configuration</h3>
    <p>Base URL: <code>https://${url.host}/v1</code></p>
    <p>API Key: <code>sk-any-key</code></p>
  </div>
  <div class="card">
    <h3>Userscript WebSocket Target</h3>
    <p>Set line 21 of <code>lmarena_injector.user.js</code> to:</p>
    <pre>SERVER_URL: "wss://${url.host}/ws"</pre>
  </div>
</body>
</html>`;
      return new Response(html, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
    }

    return new Response("Not Found", { status: 404 });
  }
}
