import { IMcpToolDefinition } from "../core/interfaces/ICommandHandler.js";
import { JObject } from "../types/index.js";
import { z } from "zod";
import { BaseCommandHandler } from "../core/BaseCommandHandler.js";

/**
 * Command handler for executing Unity menu items.
 */
export abstract class SceneCommandHandler extends BaseCommandHandler {
    /**
     * Gets the command prefix for this handler.
     */
    public get commandPrefix(): string {
        return "scene";
    }

    /**
     * Gets the description of this command handler.
     */
    public get description(): string {
        return "Executes Unity Editor menu items";
    }

    /**
     * Executes the command with the given parameters.
     * @param action The action to execute.
     * @param parameters The parameters for the command.
     * @returns A Promise that resolves to a JSON object containing the execution result.
     */
    public async execute(action: string, parameters: JObject): Promise<JObject> {
        if (action.toLowerCase() !== "command"){
            return {
                success: false,
                error: `Unknown action: ${action}. Supported actions: 'command'`
            };
        }

        return this.Command(action, parameters);
    }

    /**
     * Gets the tool definitions supported by this handler.
     * @returns A map of tool names to their definitions.
     */
    public getToolDefinitions(): Map<string, IMcpToolDefinition> {
        const tools = new Map<string, IMcpToolDefinition>();

        // Add menu_execute tool
        tools.set("scene_command", {
            description: "Processing scenes, retrieving hierarchy information, etc.",
            parameterSchema: {
                command: z.string().describe("The command to execute on the scene. e.g., 'get_hierarchy'")
            },
            annotations: {
                title: "Execute scene mcp command",
                readOnlyHint: false,
                destructiveHint: true,
                idempotentHint: false,
                openWorldHint: false
            }
        });

        return tools;
    }

    /**
     * Executes a menu item by name.
     * @param action The action to execute.
     * @param parameters The parameters containing the menu item name.
     * @returns A Promise that resolves to a JSON object indicating success or failure.
     */
    private async Command(action: string, parameters: JObject): Promise<JObject> {
        const mcpCommand = parameters.command as string;
        if (!mcpCommand) {
            return {
                success: false,
                error: "SceneCommand parameter is required"
            };
        }

        try {
            // First ensure we have a valid connection to Unity
            await this.ensureUnityConnection();

            // Forward the request to Unity using the base class helper
            const response = await this.sendUnityRequest(
                `${this.commandPrefix}.${action}`,
                { command: mcpCommand }
            );

            return response;
        } catch (ex) {
            const errorMessage = ex instanceof Error ? ex.message : String(ex);
            console.error(`Error executing scene command '${mcpCommand}': ${errorMessage}`);

            return {
                success: false,
                error: errorMessage
            };
        }
    }
}
