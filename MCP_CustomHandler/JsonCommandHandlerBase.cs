
#if UNITY_EDITOR
using UnityMCP.Editor.Core;
using Newtonsoft.Json.Linq;

namespace MCP_CustomHandler
{
    public abstract class JsonCommandHandlerBase : IMcpCommandHandler
    {
        public abstract string CommandPrefix { get; }
        public abstract string Description { get; }

        public JObject Execute(string action, JObject parameters)
        {
            var responseData = ExecuteAction(action, parameters);
            
            var jsonResponse = new JObject(
                new JProperty("UnityfunctionResponse", new JObject(
                    new JProperty("name", action),
                    new JProperty("response", new JObject(
                        new JProperty("output", responseData)
                    ))
                ))
            );

            return jsonResponse;
        }

        protected abstract JToken ExecuteAction(string action, JObject parameters);
    }
}
#endif
