import { Request, Response } from 'express';
import { RoutingService, TargetConfig } from '../../services/routing/RoutingService';

export class ProxyController {
  private routingService = new RoutingService();

  async handleProxy(req: Request, res: Response) {
    try {
      const target = await this.routingService.resolveTarget();
      
      const relativePath = req.path.replace(/^\//, '');
      const url = `${target.baseUrl}/v1/${relativePath}`;
      
      console.log(`Resolved Target: ${target.baseUrl} | Key: ${target.apiKeyLabel} | Model: ${target.modelName}`);
      console.log(`Forwarding to: ${url}`);
      
      const body = req.body;
      if (body && body.model) {
        body.model = target.modelName;
      } else if (body) {
        body.model = target.modelName;
      }

      const response = await fetch(url, {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${target.apiKey}`,
        },
        body: req.method !== 'GET' ? JSON.stringify(body) : undefined,
      });

      console.log(`Target Response Status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.text();
        console.log(`Target Error: ${errorData}`);
        return res.status(response.status).send(errorData);
      }

      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        // Streaming response
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const reader = response.body?.getReader();
        if (!reader) {
          return res.status(500).send('Failed to get response stream');
        }

        const decoder = new TextDecoder();
        let buffer = '';
        let hasToolCalls = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data !== '[DONE]') {
                try {
                  const json = JSON.parse(data);
                  if (json.choices && json.choices[0]) {
                    const choice = json.choices[0];

                    // Replace <thought> with <think> and </thought> with </think> in delta content
                    if (choice.delta?.content) {
                      choice.delta.content = choice.delta.content
                        .replace(/<thought>/g, '<think>')
                        .replace(/<\/thought>/g, '</think>');
                    }
                    
                    // Track if tool calls are being streamed
                    if (choice.delta?.tool_calls) {
                      hasToolCalls = true;
                      choice.delta.tool_calls = choice.delta.tool_calls.map((tc: any, i: number) => ({
                        ...tc,
                        index: tc.index ?? i
                      }));
                    }

                    // Force finish_reason to tool_calls if we've seen tool calls
                    if (choice.finish_reason === 'stop' && hasToolCalls) {
                      choice.finish_reason = 'tool_calls';
                    }
                  }
                  res.write(`data: ${JSON.stringify(json)}\n\n`);
                } catch (e) {
                  res.write(line + '\n\n');
                }
              } else {
                res.write(line + '\n\n');
              }
            } else {
              res.write(line + '\n\n');
            }
          }
        }
        res.end();
      } else {
        // Standard JSON response
        const data = await response.text();
        try {
            const json = JSON.parse(data);
            if (json.choices && json.choices[0]?.message?.tool_calls) {
              json.choices[0].finish_reason = 'tool_calls';
            }
            // Replace <thought> with <think> and </thought> with </think> in message content
            if (json.choices && json.choices[0]?.message?.content) {
              json.choices[0].message.content = json.choices[0].message.content
                .replace(/<thought>/g, '<think>')
                .replace(/<\/thought>/g, '</think>');
            }
            res.send(JSON.stringify(json));
        } catch (e) {
          res.send(data);
        }
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
