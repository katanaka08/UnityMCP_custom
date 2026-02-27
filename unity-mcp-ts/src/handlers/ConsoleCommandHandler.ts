import { IMcpToolDefinition } from "../core/interfaces/ICommandHandler.js";
import { JObject } from "../types/index.js";
import { z } from "zod";
import { BaseCommandHandler } from "../core/BaseCommandHandler.js";

/**
 * Command handler for accessing and managing Unity Console logs.
 */
export class ConsoleCommandHandler extends BaseCommandHandler {
    /**
     * Gets the command prefix for this handler.
     */
    public get commandPrefix(): string {
        return "console";
    }

    /**
     * Gets the description of this command handler.
     */
    public get description(): string {
        return "Access and manage Unity Console logs";
    }

    /**
     * Executes the command with the given parameters.
     * @param action The action to execute.
     * @param parameters The parameters for the command.
     * @returns A Promise that resolves to a JSON object containing the execution result.
     */
    protected async executeCommand(action: string, parameters: JObject): Promise<JObject> {
        switch (action.toLowerCase()) {
            case "getlogs":
                return await this.sendUnityRequest(`${this.commandPrefix}.getLogs`, parameters);
            case "getcount":
                return await this.sendUnityRequest(`${this.commandPrefix}.getCount`, {});
            case "clear":
                return await this.sendUnityRequest(`${this.commandPrefix}.clear`, {});
            case "setfilter":
                return await this.sendUnityRequest(`${this.commandPrefix}.setFilter`, parameters);
            default:
                return {
                    success: false,
                    error: `Unknown action: ${action}. Supported actions: getLogs, getCount, clear, setFilter`
                };
        }
    }

    /**
     * Gets the tool definitions supported by this handler.
     * @returns A map of tool names to their definitions.
     */
    public getToolDefinitions(): Map<string, IMcpToolDefinition> {
        const tools = new Map<string, IMcpToolDefinition>();

        // Add console_getLogs tool
        tools.set("console_getLogs", {
            description: "Gets logs from the Unity Console",
            parameterSchema: {
                startRow: z.number().optional().describe("The starting row index (defaults to 0)"),
                count: z.number().optional().describe("The maximum number of logs to retrieve (defaults to 100)")
            },
            annotations: {
                title: "Get Console Logs",
                readOnlyHint: true,
                openWorldHint: false
            }
        });

        // Add console_getCount tool
        tools.set("console_getCount", {
            description: "Gets the count of logs by type",
            parameterSchema: {},
            annotations: {
                title: "Get Log Count",
                readOnlyHint: true,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: false
            }
        });

        // Add console_clear tool
        tools.set("console_clear", {
            description: "Clears all logs from the console",
            parameterSchema: {},
            annotations: {
                title: "Clear Console",
                readOnlyHint: false,
                destructiveHint: true,
                idempotentHint: true,
                openWorldHint: false
            }
        });

        // Add console_setFilter tool
        tools.set("console_setFilter", {
            description: "Sets a filter on the console logs",
            parameterSchema: {
                filter: z.string().describe("The filter text to apply")
            },
            annotations: {
                title: "Set Console Filter",
                readOnlyHint: false,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: false
            }
        });

        return tools;
    }
}
