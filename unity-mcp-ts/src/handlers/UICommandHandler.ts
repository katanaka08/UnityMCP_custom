import { IMcpToolDefinition } from "../core/interfaces/ICommandHandler.js";
import { JObject } from "../types/index.js";
import { z } from "zod";
import { BaseCommandHandler } from "../core/BaseCommandHandler.js";

/**
 * Command handler for Unity UI operations.
 */
export class UICommandHandler extends BaseCommandHandler {
    public get commandPrefix(): string {
        return "ui";
    }

    public get description(): string {
        return "Handles UI creation and manipulation in Unity Editor";
    }

    public getToolDefinitions(): Map<string, IMcpToolDefinition> {
        const tools = new Map<string, IMcpToolDefinition>();

        tools.set("ui_create_base", {
            description: "Creates a basic UI set (Canvas, InputField, Text, Button) for Gemini Avatar interaction.",
            parameterSchema: {},
            annotations: {
                title: "Create Base UI",
                readOnlyHint: false,
                destructiveHint: false,
                idempotentHint: false,
                openWorldHint: false
            }
        });

        return tools;
    }

    protected async executeCommand(action: string, parameters: JObject): Promise<JObject> {
        return await this.sendUnityRequest(`${this.commandPrefix}.${action}`, parameters);
    }
}
