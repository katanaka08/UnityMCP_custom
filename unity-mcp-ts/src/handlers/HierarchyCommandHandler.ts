import { IMcpToolDefinition } from "../core/interfaces/ICommandHandler.js";
import { JObject } from "../types/index.js";
import { z } from "zod";
import { BaseCommandHandler } from "../core/BaseCommandHandler.js";

/**
 * Command handler for accessing scene hierarchy information.
 */
export class HierarchyCommandHandler extends BaseCommandHandler {
    /**
     * Gets the command prefix for this handler.
     */
    public get commandPrefix(): string {
        return "hierarchy";
    }

    /**
     * Gets the description of this command handler.
     */
    public get description(): string {
        return "Access Unity scene hierarchy information";
    }

    /**
     * Executes the command with the given parameters.
     * @param action The action to execute.
     * @param parameters The parameters for the command.
     * @returns A Promise that resolves to a JSON object containing the execution result.
     */
    protected async executeCommand(action: string, parameters: JObject): Promise<JObject> {
        if (action.toLowerCase() !== "command") {
            return {
                success: false,
                error: `Unknown action: ${action}. Supported actions: 'command'`
            };
        }

        const mcpCommand = parameters.command as string;
        if (!mcpCommand) {
            return {
                success: false,
                error: "command parameter is required"
            };
        }

        return await this.sendUnityRequest(
            `${this.commandPrefix}.${action}`,
            { command: mcpCommand }
        );
    }

    /**
     * Gets the tool definitions supported by this handler.
     * @returns A map of tool names to their definitions.
     */
    public getToolDefinitions(): Map<string, IMcpToolDefinition> {
        const tools = new Map<string, IMcpToolDefinition>();

        tools.set("hierarchy_command", {
            description: "Execute hierarchy commands: get_hierarchy, find_object, etc.",
            parameterSchema: {
                command: z.string().describe("The command to execute. e.g., 'get_hierarchy'")
            },
            annotations: {
                title: "Execute Hierarchy Command",
                readOnlyHint: true,
                destructiveHint: false,
                idempotentHint: true,
                openWorldHint: false
            }
        });

        return tools;
    }
}
