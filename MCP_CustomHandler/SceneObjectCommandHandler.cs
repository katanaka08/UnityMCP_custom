#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;

namespace MCP_CustomHandler
{
    public class SceneObjectCommandHandler
    {
        [MenuItem("unity-mcp/object/CreateEmptyObject")]
        private static void CreateEmptyObjectMenu()
        {
            var go = new GameObject("New Empty Object");
            Undo.RegisterCreatedObjectUndo(go, "Create Empty Object");
            Selection.activeGameObject = go;
            Debug.Log($"'{go.name}' was created via menu command.");
        }
    }
}
#endif
