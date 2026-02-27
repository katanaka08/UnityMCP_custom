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
            { ...parameters, command: mcpCommand }
        );
    }

    /**
     * Gets the tool definitions supported by this handler.
     * @returns A map of tool names to their definitions.
     */
    public getToolDefinitions(): Map<string, IMcpToolDefinition> {
        const tools = new Map<string, IMcpToolDefinition>();

        tools.set("hierarchy_command", {
            description: "Execute hierarchy commands. Available: get_all_objects (list all scene objects), get_object (get component details by path). For get_object, pass 'path' parameter.",
            parameterSchema: {
                command: z.string().describe("The command to execute: 'get_all_objects' or 'get_object'"),
                path: z.string().optional().describe("The hierarchy path of the object (for get_object). e.g., 'Communicator' or '/Canvas/Panel'")
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
