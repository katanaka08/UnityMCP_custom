import { IMcpToolDefinition } from "../core/interfaces/ICommandHandler.js";
import { JObject } from "../types/index.js";
import { z } from "zod";
import { BaseCommandHandler } from "../core/BaseCommandHandler.js";

/**
 * Custom console log handler for Gemini Avatar.
 */
export class ConsoleCustomHandler extends BaseCommandHandler {
    public get commandPrefix(): string {
        return "console_custom";
    }

    public get description(): string {
        return "Retrieve latest errors and logs from Unity console";
    }

    public getToolDefinitions(): Map<string, IMcpToolDefinition> {
        const tools = new Map<string, IMcpToolDefinition>();

        tools.set("console_custom_get_last_errors", {
            description: "Gets the last N error messages from the Unity console.",
            parameterSchema: {
                count: z.number().optional().describe("Number of errors to retrieve (default: 5)")
            },
            annotations: {
                title: "Get Last Errors",
                readOnlyHint: true,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: false
            }
        });

        return tools;
    }

    protected async executeCommand(action: string, parameters: JObject): Promise<JObject> {
        return await this.sendUnityRequest(`${this.commandPrefix}.${action}`, parameters);
    }
}
