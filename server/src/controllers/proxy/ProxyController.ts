import { Request, Response } from 'express';
import { RoutingService } from '../../services/routing/RoutingService';

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
          let lastUsage: any = null;
          let googleThoughtBlockActive = false;
          let reasoningIndexCounter = 0;

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
                    if (json.usage) {
                      lastUsage = json.usage;
                    }
                    if (json.choices && json.choices[0]) {
                      const choice = json.choices[0];
                     
                     // Track if tool calls are being streamed
                     if (choice.delta?.tool_calls) {
                       hasToolCalls = true;
                       choice.delta.tool_calls = choice.delta.tool_calls.map((tc: any, i: number) => ({
                         ...tc,
                          index: tc.index ?? i
                        }));
                     }

                     // Convert Google thought chunks to OpenRouter reasoning fields
                     const isGoogleThought = choice.delta?.extra_content?.google?.thought === true;

                     if (!choice.delta?.tool_calls && isGoogleThought) {
                       if (!googleThoughtBlockActive) {
                         googleThoughtBlockActive = true;
                         reasoningIndexCounter += 1;
                       }

                       if (typeof choice.delta?.content === 'string' && choice.delta.content.length > 0) {
                         const thoughtIndex = reasoningIndexCounter - 1;
                         choice.delta.reasoning = choice.delta.content;
                         choice.delta.reasoning_details = [
                           {
                             type: 'reasoning.text',
                             text: choice.delta.content,
                             format: 'unknown',
                             index: thoughtIndex,
                           },
                         ];
                         choice.delta.content = '';
                       }
                     } else {
                       googleThoughtBlockActive = false;
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
        if (lastUsage) {
          console.log(`Target Usage: ${JSON.stringify(lastUsage)}`);
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
            if (
              json.choices &&
              json.choices[0]?.message &&
              typeof json.choices[0].message.content === 'string' &&
              !json.choices[0].message.tool_calls &&
              json.choices[0].message?.extra_content?.google?.thought === true
            ) {
              json.choices[0].message.reasoning = json.choices[0].message.content;
              json.choices[0].message.reasoning_details = [
                {
                  type: 'reasoning.text',
                  text: json.choices[0].message.content,
                  format: 'unknown',
                  index: 0,
                },
              ];
              json.choices[0].message.content = '';
            }
            if (json.usage) {
              console.log(`Target Usage: ${JSON.stringify(json.usage)}`);
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
