#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;
using UnityMCP.Editor.Core;
using Newtonsoft.Json.Linq;
using System.Reflection;
using System;

namespace MCP_CustomHandler
{
    public class ConsoleLogHandler : JsonCommandHandlerBase
    {
        public override string CommandPrefix => "console_custom";
        public override string Description => "Custom console log reader for Gemini Avatar development.";

        protected override JToken ExecuteAction(string action, JObject parameters)
        {
            switch (action.ToLower())
            {
                case "get_last_errors":
                    return GetLastErrors(parameters);
                default:
                    return new JObject(new JProperty("error", $"Unknown action: {action}"));
            }
        }

        private JToken GetLastErrors(JObject parameters)
        {
            int count = parameters["count"]?.Value<int>() ?? 5;
            
            // Unity's internal LogEntries API is needed to read from the console window
            var logEntriesType = System.Type.GetType("UnityEditor.LogEntries, UnityEditor");
            if (logEntriesType == null) return new JObject(new JProperty("error", "Could not find UnityEditor.LogEntries"));

            var getCountMethod = logEntriesType.GetMethod("GetCount", BindingFlags.Static | BindingFlags.Public);
            var getEntryInternalMethod = logEntriesType.GetMethod("GetEntryInternal", BindingFlags.Static | BindingFlags.Public);
            
            if (getCountMethod == null || getEntryInternalMethod == null) 
                return new JObject(new JProperty("error", "Could not find internal log methods"));

            int totalLogs = (int)getCountMethod.Invoke(null, null);
            var results = new JArray();
            int found = 0;

            // LogEntry structure is needed
            var logEntryType = System.Type.GetType("UnityEditor.LogEntry, UnityEditor");
            var entry = Activator.CreateInstance(logEntryType);

            for (int i = totalLogs - 1; i >= 0 && found < count; i--)
            {
                getEntryInternalMethod.Invoke(null, new object[] { i, entry });
                
                string message = (string)logEntryType.GetField("condition").GetValue(entry);
                int mode = (int)logEntryType.GetField("mode").GetValue(entry);
                
                // mode bits: 1=error, 2=assert, 4=log, 8=fatal, 128=warning
                bool isError = (mode & (1 | 2 | 8 | 256 | 512 | 1024)) != 0; 

                if (isError)
                {
                    results.Add(new JObject(
                        new JProperty("index", i),
                        new JProperty("message", message)
                    ));
                    found++;
                }
            }

            return new JObject(
                new JProperty("errors", results),
                new JProperty("total_logs", totalLogs)
            );
        }
    }
}
#endif
