import express, { Express, Request, Response } from 'express';
import { Server } from 'http';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { randomUUID } from 'crypto';

/**
 * HTTP-based MCP server using StreamableHTTP transport.
 * Uses a single shared transport in stateless mode for maximum scalability.
 */
export class HttpMcpServer {
    private app: Express;
    private httpServer: Server | null = null;
    private transport: StreamableHTTPServerTransport;
    private mcpServer: McpServer;

    constructor(mcpServer: McpServer) {
        this.mcpServer = mcpServer;
        this.app = express();

        // Create a single stateless transport
        // Stateless mode: no session validation, suitable for multiple concurrent clients
        this.transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined // Stateless mode
        });

        this.setupMiddleware();
        this.setupRoutes();
    }

    /**
     * Configure Express middleware
     */
    private setupMiddleware(): void {
        // Parse JSON bodies
        this.app.use(express.json());

        // Log incoming requests
        this.app.use((req, _res, next) => {
            console.error(`[HTTP] ${req.method} ${req.path}`);
            next();
        });
    }

    /**
     * Configure HTTP routes
     */
    private setupRoutes(): void {
        // MCP endpoint - handles both POST (requests) and GET (SSE)
        this.app.post('/mcp', (req, res) => this.handleMcpRequest(req, res));
        this.app.get('/mcp', (req, res) => this.handleMcpRequest(req, res));

        // Health check endpoint
        this.app.get('/health', (_req, res) => {
            res.json({
                status: 'ok',
                version: '2.0.0',
                transport: 'http'
            });
        });

        // Root endpoint
        this.app.get('/', (_req, res) => {
            res.json({
                name: 'Unity MCP Server',
                version: '2.0.0',
                transport: 'http',
                endpoints: {
                    mcp: '/mcp',
                    health: '/health'
                }
            });
        });
    }

    /**
     * Handle MCP requests (both POST and GET for SSE)
     */
    private async handleMcpRequest(req: Request, res: Response): Promise<void> {
        try {
            // Handle the request through the transport
            // The transport handles both POST requests and GET SSE automatically
            await this.transport.handleRequest(req as any, res as any, req.body);
        } catch (error) {
            console.error(`[HTTP] Error handling MCP request: ${error instanceof Error ? error.message : String(error)}`);
            if (!res.headersSent) {
                res.status(500).json({
                    error: 'Internal server error',
                    message: error instanceof Error ? error.message : String(error)
                });
            }
        }
    }

    /**
     * Start the HTTP server
     * @param host The host to bind to (default: 127.0.0.1)
     * @param port The port to listen on (default: 44682)
     */
    public async start(host: string = '127.0.0.1', port: number = 44682): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                // Connect the transport to the MCP server
                await this.mcpServer.connect(this.transport);
                console.error(`[INFO] MCP server connected to HTTP transport`);

                // Set up transport event handlers
                this.transport.onclose = () => {
                    console.error(`[INFO] Transport closed`);
                };

                this.transport.onerror = (error: Error) => {
                    console.error(`[ERROR] Transport error: ${error.message}`);
                };

                // Start HTTP server
                this.httpServer = this.app.listen(port, host, () => {
                    console.error(`[INFO] HTTP MCP Server listening on http://${host}:${port}`);
                    console.error(`[INFO] MCP endpoint: http://${host}:${port}/mcp`);
                    console.error(`[INFO] Health check: http://${host}:${port}/health`);
                    resolve();
                });

                this.httpServer.on('error', (err) => {
                    console.error(`[ERROR] HTTP server error: ${err.message}`);
                    reject(err);
                });
            } catch (err) {
                console.error(`[ERROR] Failed to start HTTP server: ${err instanceof Error ? err.message : String(err)}`);
                reject(err);
            }
        });
    }

    /**
     * Stop the HTTP server
     */
    public async stop(): Promise<void> {
        return new Promise((resolve, reject) => {
            // Close transport
            console.error(`[INFO] Closing transport`);
            this.transport.close();

            // Close HTTP server
            if (this.httpServer) {
                this.httpServer.close((err) => {
                    if (err) {
                        console.error(`[ERROR] Error stopping HTTP server: ${err.message}`);
                        reject(err);
                    } else {
                        console.error(`[INFO] HTTP server stopped`);
                        this.httpServer = null;
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }
}
