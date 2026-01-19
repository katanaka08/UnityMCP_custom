#if UNITY_EDITOR
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityMCP.Editor.Core;
using Newtonsoft.Json.Linq;
using System.Collections.Generic; // Required for List<>
using Newtonsoft.Json;
using UnityEngine.SceneManagement; // Required for testing serialization

namespace MCP_CustomHandler
{
    // Data Transfer Object for GameObject information
    [System.Serializable]
    public class GameObjectInfo
    {
        public string name;
        public int instanceId;
        public bool activeSelf;
        public List<GameObjectInfo> children;
    }

    // Data Transfer Object for the entire scene's information
    [System.Serializable]
    public class SceneInfo
    {
        public string sceneName;
        public int rootObjectCount;
        public List<GameObjectInfo> rootGameObjects;
    }

    public class SceneInfoHandler : JsonCommandHandlerBase
    {
        public override string CommandPrefix => "scene";
        public override string Description => "Provides commands to inspect the active scene.";

        protected override JToken ExecuteAction(string action, JObject parameters)
        {
            var scene = EditorSceneManager.GetActiveScene();
            if (!scene.IsValid())
            {
                return JObject.FromObject(new SceneInfo { sceneName = "Invalid Scene", rootObjectCount = 0, rootGameObjects = new List<GameObjectInfo>() });
            }
            
            Debug.Log($"ExecuteAction action:{action}, parameters:{parameters}");

            switch (parameters["command"].ToString())
            {
                case "get_hierarchy":
                    return JObject.FromObject(GetSceneObjects(scene));
                default:
                    return new JObject(new JProperty("error", $"Invalid action for command '{CommandPrefix}': {action}"));
            }
        }

        private static SceneInfo GetSceneObjects(Scene scene)
        {
            var rootObjects = scene.GetRootGameObjects();
            
            var sceneInfo = new SceneInfo
            {
                sceneName = scene.name,
                rootObjectCount = rootObjects.Length,
                rootGameObjects = new List<GameObjectInfo>()
            };

            foreach (var go in rootObjects)
            {
                sceneInfo.rootGameObjects.Add(CreateGameObjectInfo(go));
            }

            return sceneInfo;
        }

        // Made static again for testing purposes
        private static GameObjectInfo CreateGameObjectInfo(GameObject go)
        {
            var goInfo = new GameObjectInfo
            {
                name = go.name,
                instanceId = go.GetInstanceID(),
                activeSelf = go.activeSelf,
                children = new List<GameObjectInfo>()
            };

            for (int i = 0; i < go.transform.childCount; i++)
            {
                goInfo.children.Add(CreateGameObjectInfo(go.transform.GetChild(i).gameObject));
            }

            return goInfo;
        }

        // ============== TEMPORARY TEST MENU =================
        [MenuItem("unity-mcp/internal/TestRefactoredGetSceneObjects")]
        private static void TestRefactoredGetSceneObjectsMenu()
        {
            // Ultimate simplification test: Just log a message.
            Debug.Log("Test Menu Registered Successfully!");
        }
        // =======================================================
    }
}
#endif
