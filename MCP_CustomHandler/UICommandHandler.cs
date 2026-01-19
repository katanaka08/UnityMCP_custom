#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;
using TMPro;
using UnityMCP.Editor.Core;
using Newtonsoft.Json.Linq;

namespace MCP_CustomHandler
{
    public class UICommandHandler : JsonCommandHandlerBase
    {
        public override string CommandPrefix => "ui";
        public override string Description => "Handles UI creation and manipulation in Unity.";

        [MenuItem("unity-mcp/ui/CreateBaseUI")]
        public static void CreateBaseUIMenu()
        {
            var instance = new UICommandHandler();
            instance.CreateUIBase();
        }

        protected override JToken ExecuteAction(string action, JObject parameters)
        {
            switch (action.ToLower())
            {
                case "create_base":
                    return CreateUIBase();
                default:
                    return new JObject(new JProperty("error", $"Unknown action: {action}"));
            }
        }

        private JToken CreateUIBase()
        {
            // 1. Create EventSystem if not exists
            if (Object.FindFirstObjectByType<EventSystem>() == null)
            {
                var eventSystem = new GameObject("EventSystem");
                eventSystem.AddComponent<EventSystem>();
                eventSystem.AddComponent<StandaloneInputModule>();
                Undo.RegisterCreatedObjectUndo(eventSystem, "Create EventSystem");
            }

            // 2. Create Canvas
            var canvasGo = new GameObject("GeminiAvatar_Canvas");
            var canvas = canvasGo.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvasGo.AddComponent<CanvasScaler>();
            canvasGo.AddComponent<GraphicRaycaster>();
            Undo.RegisterCreatedObjectUndo(canvasGo, "Create Canvas");

            // 3. Create Background (Panel)
            var panelGo = new GameObject("Panel_Background");
            panelGo.transform.SetParent(canvasGo.transform, false);
            var panelImg = panelGo.AddComponent<Image>();
            panelImg.color = new Color(0, 0, 0, 0.5f);
            var panelRect = panelGo.GetComponent<RectTransform>();
            panelRect.anchorMin = Vector2.zero;
            panelRect.anchorMax = Vector2.one;
            panelRect.offsetMin = Vector2.zero;
            panelRect.offsetMax = Vector2.zero;

            // 4. Create TMP InputField
            var inputGo = CreateTMPInputField("Prompt_InputField", panelGo.transform);
            var inputRect = inputGo.GetComponent<RectTransform>();
            inputRect.anchorMin = new Vector2(0.1f, 0.1f);
            inputRect.anchorMax = new Vector2(0.7f, 0.2f);
            inputRect.offsetMin = Vector2.zero;
            inputRect.offsetMax = Vector2.zero;

            // 5. Create Send Button
            var buttonGo = CreateButton("Send_Button", panelGo.transform, "Send");
            var buttonRect = buttonGo.GetComponent<RectTransform>();
            buttonRect.anchorMin = new Vector2(0.75f, 0.1f);
            buttonRect.anchorMax = new Vector2(0.9f, 0.2f);
            buttonRect.offsetMin = Vector2.zero;
            buttonRect.offsetMax = Vector2.zero;

            // 6. Create TMP Text for Response
            var textGo = CreateTMPText("Response_Text", panelGo.transform, "Waiting for Gemini...");
            var textRect = textGo.GetComponent<RectTransform>();
            textRect.anchorMin = new Vector2(0.1f, 0.3f);
            textRect.anchorMax = new Vector2(0.9f, 0.9f);
            textRect.offsetMin = Vector2.zero;
            textRect.offsetMax = Vector2.zero;

            Selection.activeGameObject = canvasGo;

            return new JObject(
                new JProperty("status", "success"),
                new JProperty("canvasName", canvasGo.name)
            );
        }

        private GameObject CreateTMPInputField(string name, Transform parent)
        {
            var go = DefaultControls.CreateInputField(new DefaultControls.Resources()); // Use default for structure
            go.name = name;
            go.transform.SetParent(parent, false);
            
            // Convert to TMP InputField
            Object.DestroyImmediate(go.GetComponent<InputField>());
            Object.DestroyImmediate(go.transform.Find("Placeholder").gameObject);
            Object.DestroyImmediate(go.transform.Find("Text").gameObject);

            var tmpInput = go.AddComponent<TMP_InputField>();
            
            // Placeholder
            var placeholderGo = new GameObject("Placeholder");
            placeholderGo.transform.SetParent(go.transform, false);
            var placeholderText = placeholderGo.AddComponent<TextMeshProUGUI>();
            placeholderText.text = "Enter prompt...";
            placeholderText.fontStyle = FontStyles.Italic;
            placeholderText.color = new Color(0.5f, 0.5f, 0.5f, 0.5f);
            placeholderText.alignment = TextAlignmentOptions.Left;
            var placeholderRect = placeholderGo.GetComponent<RectTransform>();
            placeholderRect.anchorMin = Vector2.zero;
            placeholderRect.anchorMax = Vector2.one;
            placeholderRect.sizeDelta = Vector2.zero;

            // Text Area
            var textAreaGo = new GameObject("Text Area");
            textAreaGo.transform.SetParent(go.transform, false);
            textAreaGo.AddComponent<RectMask2D>();
            var textAreaRect = textAreaGo.GetComponent<RectTransform>();
            textAreaRect.anchorMin = Vector2.zero;
            textAreaRect.anchorMax = Vector2.one;
            textAreaRect.sizeDelta = Vector2.zero;

            // Text
            var textGo = new GameObject("Text");
            textGo.transform.SetParent(textAreaGo.transform, false);
            var textComponent = textGo.AddComponent<TextMeshProUGUI>();
            textComponent.color = Color.black;
            textComponent.alignment = TextAlignmentOptions.Left;
            var textRect = textGo.GetComponent<RectTransform>();
            textRect.anchorMin = Vector2.zero;
            textRect.anchorMax = Vector2.one;
            textRect.sizeDelta = Vector2.zero;

            tmpInput.textViewport = textAreaRect;
            tmpInput.textComponent = textComponent;
            tmpInput.placeholder = placeholderText;

            return go;
        }

        private GameObject CreateButton(string name, Transform parent, string label)
        {
            var go = DefaultControls.CreateButton(new DefaultControls.Resources());
            go.name = name;
            go.transform.SetParent(parent, false);
            var text = go.GetComponentInChildren<Text>();
            if (text != null)
            {
                Object.DestroyImmediate(text.gameObject);
                var tmpText = new GameObject("Text (TMP)");
                tmpText.transform.SetParent(go.transform, false);
                var t = tmpText.AddComponent<TextMeshProUGUI>();
                t.text = label;
                t.color = Color.black;
                t.alignment = TextAlignmentOptions.Center;
                var tr = tmpText.GetComponent<RectTransform>();
                tr.anchorMin = Vector2.zero;
                tr.anchorMax = Vector2.one;
                tr.sizeDelta = Vector2.zero;
            }
            return go;
        }

        private GameObject CreateTMPText(string name, Transform parent, string initialText)
        {
            var go = new GameObject(name);
            go.transform.SetParent(parent, false);
            var text = go.AddComponent<TextMeshProUGUI>();
            text.text = initialText;
            text.fontSize = 24;
            text.alignment = TextAlignmentOptions.TopLeft;
            return go;
        }
    }
}
#endif
